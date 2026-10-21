/**
 * Client for the FastAPI backend + mappers from the API's JSON to the app's types.
 *
 * Backend URL, in order of priority:
 *  1. EXPO_PUBLIC_API_URL (e.g. in frontend/.env)
 *  2. Web on localhost / LAN / dev port   -> same host, port 8000
 *  3. Deployed web (e.g. Vercel)          -> same origin (/api is routed to Python)
 *  4. Expo Go on a phone                  -> the laptop's LAN IP from Expo, port 8000
 */
import { Platform } from "react-native";
import Constants from "expo-constants";
import type { CartItem, Category, Post, PostType, Recipe, Spot } from "../constants/data";
import { rp } from "../constants/theme";

/* ------------------------------------------------------------------ */
/* Types that only exist on the server side                            */
/* ------------------------------------------------------------------ */

export type User = {
  id: number;
  name: string;
  email: string | null;
  is_guest: boolean;
  campus: string;
  daily_budget: number;
  shop_budget: number;
  prefs: string[];
  allergies: string;
  reminder_time: string;
};

export type Badge = { key: string; label: string; icon: string; earned: boolean; hint: string };

export type Stats = {
  today_spent: number;
  history: { date: string; amount: number; budget: number }[];
  saved_count: number;
  shared_count: number;
  saved_this_month: number;
  cook_count: number;
  xp: number;
  level: number;
  level_title: string;
  next_level_xp: number;
  badges: Badge[];
};

export type Comment = { id: number; author: string; text: string; time: string };

export type GenerateResult = { recipes: Recipe[]; note: string; engine: "gemini" | "rules" | "offline" };

/* Raw API shapes */
type ApiIngredient = {
  id: number;
  name: string;
  qty: number;
  unit: string;
  price: number;
  cat: Category;
  pantry: boolean;
  step: number;
  swap: { to: string; qty: number; unit: string; saving: number } | null;
};
type ApiRecipe = {
  id: number;
  title: string;
  art: number;
  color: string;
  minutes: number;
  tip: string;
  tools: string[];
  parent_id: number | null;
  ingredients: ApiIngredient[];
  steps: { text: string; seconds: number }[];
  cost: number;
  pantry_cost: number;
  kcal: number;
  protein: number;
  carbs: number;
  score: number;
  tags: string[];
  pay?: number;
};
type ApiPost = {
  id: number;
  author: string;
  campus: string;
  time: string;
  type: PostType;
  recipe_id: number | null;
  image_url: string | null;
  cost: number | null;
  title: string;
  body: string;
  location: string | null;
  cook_time: string | null;
  per_portion: string | null;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: number;
  mine: boolean;
};
type ApiCart = { id: number; name: string; qty: number; unit: string; price: number; cat: Category; done: boolean };
type ApiSpot = { id: number; name: string; distance: string; hours: string; price: number; rating: string; tags: string[]; open_now: boolean };

/* Mappers: API JSON -> app types used by the screens */
const fmtQty = (q: number) => String(+q.toFixed(2));

export const toRecipe = (r: ApiRecipe): Recipe => ({
  id: r.id,
  title: r.title,
  color: r.color,
  min: r.minutes,
  cal: r.kcal,
  pro: r.protein,
  carb: r.carbs,
  score: r.score,
  tip: r.tip,
  art: r.art,
  cost: r.cost,
  pay: r.pay,
  pantryCost: r.pantry_cost,
  parentId: r.parent_id,
  tools: r.tools,
  tags: r.tags,
  ing: r.ingredients.map(i => ({
    id: i.id,
    name: i.name,
    qty: i.qty,
    unit: i.unit,
    price: i.price,
    cat: i.cat,
    step: i.step,
    pantry: i.pantry,
    swapTo: i.swap,
    swap: i.swap ? `${i.swap.to} ${fmtQty(i.swap.qty)} ${i.swap.unit}, hemat ${rp(i.swap.saving)}` : undefined,
  })),
  steps: r.steps.map(s => ({ text: s.text, sec: s.seconds })),
});

export const toPost = (p: ApiPost): Post => ({
  key: String(p.id),
  id: p.id,
  name: p.author,
  campus: p.campus,
  time: p.time,
  type: p.type,
  recipeId: p.recipe_id ?? undefined,
  cost: p.cost ?? undefined,
  title: p.title,
  text: p.body,
  loc: p.location ?? undefined,
  cookTime: p.cook_time ?? undefined,
  perPortion: p.per_portion ?? undefined,
  likes: p.likes,
  comments: p.comments,
  imageUrl: p.image_url,
  liked: p.liked,
  saved: p.saved,
  mine: p.mine,
});

export const toCart = (c: ApiCart): CartItem => ({ ...c });

export const toSpot = (s: ApiSpot): Spot => ({
  id: s.id,
  name: s.name,
  distance: s.distance,
  hours: s.hours,
  price: s.price,
  rating: s.rating,
  tags: s.tags,
  openNow: s.open_now,
});

/* ------------------------------------------------------------------ */
/* HTTP                                                                */
/* ------------------------------------------------------------------ */

export function apiBase(): string {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const local = hostname === "localhost" || hostname.startsWith("127.") || /^(192\.168|10\.|172\.)/.test(hostname);
    if (local || ["8081", "8082", "19006"].includes(port)) return `${protocol}//${hostname}:8000`;
    return ""; // same origin
  }
  const host = (Constants.expoConfig?.hostUri ?? "").split(":")[0];
  return `http://${host || "localhost"}:8000`;
}

/** Absolute URL for an uploaded image path like "/api/uploads/x.jpg". */
export const assetUrl = (path?: string | null) => (path && path.startsWith("/") ? apiBase() + path : path ?? null);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;
export const setToken = (t: string | null) => (token = t);
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

async function req<T>(method: string, path: string, body?: unknown, timeoutMs = 12000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiBase()}/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401 && token) onUnauthorized?.();
      const detail = data?.detail;
      const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? "Data yang diisi belum valid" : `Error ${res.status}`;
      throw new ApiError(res.status, msg);
    }
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, "Server tidak bisa dihubungi");
  } finally {
    clearTimeout(timer);
  }
}

type Session = { token: string; user: User };
const cartList = (p: Promise<ApiCart[]>) => p.then(l => l.map(toCart));

export const api = {
  /** Resolves true if the backend answers within `ms`. */
  ping: async (ms = 2500) => {
    try {
      await req("GET", "/health", undefined, ms);
      return true;
    } catch {
      return false;
    }
  },

  register: (name: string, email: string, password: string) => req<Session>("POST", "/auth/register", { name, email, password }),
  login: (email: string, password: string) => req<Session>("POST", "/auth/login", { email, password }),
  guest: () => req<Session>("POST", "/auth/guest"),
  me: () => req<User>("GET", "/me"),
  updateMe: (patch: Partial<User>) => req<User>("PUT", "/me", patch),
  stats: () => req<Stats>("GET", "/me/stats"),

  generate: async (budget: number, filters: string[], nonce: number): Promise<GenerateResult> => {
    const r = await req<{ recipes: ApiRecipe[]; note: string; engine: "gemini" | "rules" }>(
      "POST",
      "/recipes/generate",
      { budget, filters, nonce },
      30000
    );
    return { ...r, recipes: r.recipes.map(toRecipe) };
  },
  today: (budget: number) => req<ApiRecipe[]>("GET", `/recipes/today?budget=${budget}`).then(l => l.map(toRecipe)),
  recipe: (id: number) => req<ApiRecipe>("GET", `/recipes/${id}`).then(toRecipe),
  swap: (id: number, ingredientId: number) => req<ApiRecipe>("POST", `/recipes/${id}/swap`, { ingredient_id: ingredientId }).then(toRecipe),

  saved: () => req<ApiRecipe[]>("GET", "/saved").then(l => l.map(toRecipe)),
  save: (id: number) => req("POST", `/saved/${id}`),
  unsave: (id: number) => req("DELETE", `/saved/${id}`),

  cart: () => cartList(req("GET", "/cart")),
  addCart: (item: { name: string; qty: number; unit: string; price: number; category: string }) => cartList(req("POST", "/cart", item)),
  cartFromRecipe: (id: number) => cartList(req("POST", `/cart/from-recipe/${id}`)),
  patchCart: (id: number, patch: { done?: boolean; qty?: number; price?: number }) => cartList(req("PATCH", `/cart/${id}`, patch)),
  deleteCart: (id: number) => cartList(req("DELETE", `/cart/${id}`)),
  clearDone: () => cartList(req("DELETE", "/cart")),

  addExpense: (amount: number, recipeId?: number) => req("POST", "/expenses", { amount, recipe_id: recipeId ?? null }),

  posts: () => req<ApiPost[]>("GET", "/posts").then(l => l.map(toPost)),
  createPost: (p: Record<string, unknown>) => req<ApiPost>("POST", "/posts", p, 30000).then(toPost),
  like: (id: number) => req<ApiPost>("POST", `/posts/${id}/like`).then(toPost),
  bookmark: (id: number) => req<ApiPost>("POST", `/posts/${id}/save`).then(toPost),
  comments: (id: number) => req<Comment[]>("GET", `/posts/${id}/comments`),
  comment: (id: number, text: string) => req<Comment[]>("POST", `/posts/${id}/comments`, { text }),

  spots: (tags: string[]) =>
    req<ApiSpot[]>(
      "GET",
      `/spots?tags=${encodeURIComponent(tags.filter(t => t !== "Buka sekarang").join(","))}&open_now=${tags.includes("Buka sekarang")}`
    ).then(l => l.map(toSpot)),
};
