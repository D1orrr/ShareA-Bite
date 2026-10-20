/**
 * App state + data access.
 *
 * Online mode: everything goes through the FastAPI backend (lib/api.ts).
 * Offline mode: when the backend can't be reached at start-up, the app keeps working with
 * the sample data in constants/data.ts, saved on the device, so `npx expo start` alone runs.
 */
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem, Post, POSTS, Recipe, RECIPES, recipeCost, Spot, SPOTS, START_CART } from "../constants/data";
import { api, ApiError, Comment, GenerateResult, setToken, setUnauthorizedHandler, Stats, User } from "../lib/api";
import { useToast } from "../components/Overlay";

export type RecipeTab = "Detail" | "Langkah" | "Nutrisi";
type Mode = "online" | "offline";
type HistoryRow = { date: string; amount: number; budget: number };

export const BUDGET_MIN = 5000;
export const BUDGET_MAX = 50000;

const K_TOKEN = "sab_token";
const K_OFFLINE = "sab_offline_v1";

const OFFLINE_USER: User = {
  id: 0,
  name: "Kawan",
  email: null,
  is_guest: true,
  campus: "",
  daily_budget: 15000,
  shop_budget: 35000,
  prefs: ["Halal", "Pedas", "Rice cooker", "Kompor"],
  allergies: "",
  reminder_time: "19:00",
};

const SEED_COMMENTS: Record<string, Comment[]> = {
  p1: [
    { id: 1, author: "Sari", text: "Wah aku coba besok, makasih tipsnya!", time: "1 jam lalu" },
    { id: 2, author: "Andre", text: "Tepung bumbunya merk apa kak?", time: "40 menit lalu" },
  ],
  p2: [{ id: 3, author: "Lala", text: "Valid, aku juga sering beli sore di situ.", time: "3 jam lalu" }],
  p3: [{ id: 4, author: "Rina", text: "Saus tiram mini emang penyelamat akhir bulan 😂", time: "20 jam lalu" }],
};

type OfflineStore = {
  user: User | null;
  cart: CartItem[];
  saved: Recipe[];
  posts: Post[];
  history: HistoryRow[];
  comments: Record<string, Comment[]>;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function freshOffline(): OfflineStore {
  const hist = [12500, 9500, 14000, 8800, 11000, 7500];
  return {
    user: null,
    cart: START_CART.map((c, i) => ({ ...c, id: i + 1 })),
    saved: [RECIPES[0]],
    posts: POSTS.map(p => ({ ...p, comments: SEED_COMMENTS[p.key]?.length ?? 0 })),
    history: hist.map((amount, i) => ({
      date: new Date(Date.now() - (hist.length - i) * 86400000).toISOString().slice(0, 10),
      amount,
      budget: 15000,
    })),
    comments: SEED_COMMENTS,
  };
}

const LEVELS = ["Anak Kos Baru", "Anak Kos Hemat", "Anak Kos Pintar", "Master Masak Air", "Sultan Warteg", "Legenda Tanggal Tua"];

/** Same rules as the backend's /me/stats, for offline mode. */
function offlineStats(history: HistoryRow[], saved: number, shared: number, bought: number, prefs: string[]): Stats {
  const xp = 20 * history.length + 30 * shared + 5 * saved + 5 * bought;
  const level = Math.min(LEVELS.length, 1 + Math.floor(xp / 100));
  const under = history.filter(h => h.amount <= h.budget).length;
  return {
    today_spent: history.filter(h => h.date === todayISO()).reduce((a, h) => a + h.amount, 0),
    history: history.slice(-7),
    saved_count: saved,
    shared_count: shared,
    saved_this_month: history.reduce((a, h) => a + Math.max(0, h.budget - h.amount), 0),
    cook_count: history.length,
    xp,
    level,
    level_title: `Lv.${level} ${LEVELS[level - 1]}`,
    next_level_xp: level * 100,
    badges: [
      { key: "hemat", label: "Hemat Hero", icon: "workspace_premium", earned: under >= 3, hint: "Masak 3x di bawah budget" },
      { key: "pedas", label: "Spice Lord", icon: "local_fire_department", earned: prefs.includes("Pedas") && history.length >= 1, hint: "Suka pedas & sudah masak" },
      { key: "pasar", label: "Pasar Hunter", icon: "shopping_basket", earned: bought >= 3, hint: "Centang 3 bahan belanja" },
    ],
  };
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

// The toast lives in OverlayProvider (rendered inside this store); ToastBridge hands it over.
let toastFn: (m: string) => void = () => {};
export function ToastBridge() {
  const toast = useToast();
  useEffect(() => {
    toastFn = toast;
  }, [toast]);
  return null;
}
const toast = (m: string) => toastFn(m);

function useStoreValue() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("online");
  const [user, setUser] = useState<User | null>(null);
  const [serverStats, setServerStats] = useState<Stats | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [today, setToday] = useState<Recipe[]>([]);
  const [results, setResults] = useState<GenerateResult | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  // UI state kept across screens (from the original store)
  const [tab, setTab] = useState("Semua");
  const [tabD, setTabD] = useState<RecipeTab>("Detail");
  const [spot, setSpot] = useState<string[]>(["Buka sekarang"]);
  const cache = useRef<Record<number, Recipe>>({});
  const online = mode === "online";

  const remember = (rs: Recipe[]) => rs.forEach(r => (cache.current[r.id] = r));

  /** Run an API call; toast the error and return null on failure. */
  const call = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Terjadi kesalahan");
      return null;
    }
  }, []);

  /* ------------------------------ boot ------------------------------ */

  const loadAll = useCallback(async (u?: User) => {
    const me = u ?? (await api.me());
    setUser(me);
    const [st, c, s, p, td] = await Promise.all([api.stats(), api.cart(), api.saved(), api.posts(), api.today(me.daily_budget)]);
    setServerStats(st);
    setCart(c);
    setSavedRecipes(s);
    setPosts(p);
    setToday(td);
    remember([...s, ...td]);
  }, []);

  useEffect(() => {
    (async () => {
      let tok: string | null = null;
      let stored: OfflineStore | null = null;
      try {
        tok = await AsyncStorage.getItem(K_TOKEN);
        const raw = await AsyncStorage.getItem(K_OFFLINE);
        stored = raw ? JSON.parse(raw) : null;
      } catch {
        /* storage unavailable: start fresh */
      }
      if (await api.ping()) {
        setMode("online");
        if (tok) {
          setToken(tok);
          try {
            await loadAll();
          } catch {
            setToken(null);
            setUser(null);
            AsyncStorage.removeItem(K_TOKEN).catch(() => {});
          }
        }
      } else {
        const st = stored ?? freshOffline();
        setMode("offline");
        setUser(st.user);
        setCart(st.cart);
        setSavedRecipes(st.saved);
        setPosts(st.posts);
        setHistory(st.history);
        setComments(st.comments);
        setToday(RECIPES);
        remember([...RECIPES, ...st.saved]);
        setTimeout(() => toast("Mode offline: backend tidak terhubung, pakai data contoh"), 800);
      }
      setReady(true);
    })();
  }, [loadAll]);

  // Persist offline data on every change
  useEffect(() => {
    if (!ready || online) return;
    const st: OfflineStore = { user, cart, saved: savedRecipes, posts, history, comments };
    AsyncStorage.setItem(K_OFFLINE, JSON.stringify(st)).catch(() => {});
  }, [ready, online, user, cart, savedRecipes, posts, history, comments]);

  /* ------------------------------ auth ------------------------------ */

  const startSession = async (s: { token: string; user: User }) => {
    setToken(s.token);
    await AsyncStorage.setItem(K_TOKEN, s.token).catch(() => {});
    await loadAll(s.user);
    setResults(null);
  };

  const logout = useCallback(async () => {
    setToken(null);
    await AsyncStorage.removeItem(K_TOKEN).catch(() => {});
    setUser(null);
    setResults(null);
    setServerStats(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast("Sesi berakhir, silakan masuk lagi");
    });
  }, [logout]);

  const offlineAuth = () => {
    toast("Server offline: masuk sebagai tamu dulu ya");
    return false;
  };

  const register = async (name: string, email: string, password: string) => {
    if (!online) return offlineAuth();
    const s = await call(() => api.register(name, email, password));
    if (!s) return false;
    await startSession(s);
    return true;
  };

  const login = async (email: string, password: string) => {
    if (!online) return offlineAuth();
    const s = await call(() => api.login(email, password));
    if (!s) return false;
    await startSession(s);
    return true;
  };

  const loginGuest = async () => {
    if (!online) {
      setUser(u => u ?? { ...OFFLINE_USER });
      return true;
    }
    const s = await call(() => api.guest());
    if (!s) return false;
    await startSession(s);
    return true;
  };

  /* ---------------------------- profile ----------------------------- */

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Partial<User>>({});

  /** Update locally right away; send to the server (debounced). */
  const patchUser = (patch: Partial<User>, delay = 500) => {
    setUser(u => (u ? { ...u, ...patch } : u));
    if (!online) return;
    pending.current = { ...pending.current, ...patch };
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const body = pending.current;
      pending.current = {};
      const u = await call(() => api.updateMe(body));
      if (u && body.daily_budget) {
        const td = await api.today(u.daily_budget).catch(() => null);
        if (td) {
          setToday(td);
          remember(td);
        }
      }
    }, delay);
  };

  const budget = user?.daily_budget ?? 15000;
  const pick = user?.prefs ?? [];

  /* ---------------------------- recipes ----------------------------- */

  const generate = async (nonce: number) => {
    let res: GenerateResult | null;
    if (online) {
      res = await call(() => api.generate(budget, pick, nonce));
    } else {
      const bahanAda = pick.includes("Bahan ada");
      const pantry = ["Nasi putih", "Minyak goreng", "Kecap manis"];
      const recipes = RECIPES.map(r => ({
        ...r,
        pay: recipeCost(r) - (bahanAda ? r.ing.filter(i => pantry.includes(i.name)).reduce((a, i) => a + i.price, 0) : 0),
      }));
      res = { recipes, engine: "offline", note: "Mode offline: ini resep contoh. Jalankan backend untuk generate resep sesuai budget & preferensi." };
    }
    if (res) {
      remember(res.recipes);
      setResults(res);
    }
    return res;
  };

  const cachedRecipe = (id: number): Recipe | undefined => cache.current[id];

  const getRecipe = async (id: number) => {
    if (cache.current[id]) return cache.current[id];
    if (!online) return RECIPES.find(r => r.id === id) ?? null;
    const r = await call(() => api.recipe(id));
    if (r) remember([r]);
    return r;
  };

  /** Apply the cheaper swap of one ingredient; returns the new "versi hemat" recipe. */
  const swapIngredient = async (r: Recipe, index: number) => {
    const ing = r.ing[index];
    if (!ing?.swapTo) return null;
    let out: Recipe | null;
    if (online && ing.id) {
      out = await call(() => api.swap(r.id, ing.id!));
    } else {
      const s = ing.swapTo;
      const newIng = r.ing.map((x, i) =>
        i === index ? { ...x, name: s.to, qty: s.qty, unit: s.unit, price: x.price - s.saving, swap: undefined, swapTo: null } : x
      );
      out = {
        ...r,
        id: 100000 + Math.floor(Math.random() * 1e6),
        title: r.title.endsWith("(versi hemat)") ? r.title : `${r.title} (versi hemat)`,
        parentId: r.parentId ?? r.id,
        art: r.art ?? r.id,
        ing: newIng,
        cost: newIng.reduce((a, x) => a + x.price, 0),
        pay: undefined,
      };
    }
    if (out) remember([out]);
    return out;
  };

  const saved = useMemo(() => savedRecipes.map(r => r.id), [savedRecipes]);

  /** Toggle a saved recipe. Returns true when it is now saved. */
  const toggleSaved = (id: number) => {
    const r = cache.current[id] ?? savedRecipes.find(x => x.id === id);
    const had = saved.includes(id);
    if (!r && !had) return false;
    setSavedRecipes(l => (had ? l.filter(x => x.id !== id) : [r!, ...l]));
    if (online) {
      call(() => (had ? api.unsave(id) : api.save(id))).then(ok => {
        if (ok === null) setSavedRecipes(l => (had && r ? [r, ...l] : l.filter(x => x.id !== id)));
        else api.stats().then(setServerStats).catch(() => {});
      });
    }
    return !had;
  };

  /* ------------------------------ cart ------------------------------ */

  const addToCart = async (r: Recipe) => {
    if (online && r.id < 100000) {
      const c = await call(() => api.cartFromRecipe(r.id));
      if (!c) return;
      setCart(c);
    } else {
      setCart(p => {
        const next = p.map(x => ({ ...x }));
        for (const x of r.ing) {
          const m = next.find(c => c.name === x.name && c.unit === x.unit);
          if (m) {
            m.qty += x.qty;
            m.price += x.price;
            m.done = false;
          } else next.push({ id: Date.now() + Math.random(), name: x.name, qty: x.qty, unit: x.unit, price: x.price, cat: x.cat, done: false });
        }
        return next;
      });
    }
    toast("Bahan masuk ke Belanja");
  };

  const addCartItem = async (item: { name: string; price: number; category: CartItem["cat"] }) => {
    if (online) {
      const c = await call(() => api.addCart({ ...item, qty: 1, unit: "pcs" }));
      if (c) setCart(c);
    } else {
      setCart(p => [...p, { id: Date.now(), name: item.name, qty: 1, unit: "pcs", price: item.price, cat: item.category, done: false }]);
    }
  };

  const toggleCart = async (i: number) => {
    const item = cart[i];
    if (!item) return;
    setCart(p => p.map((x, j) => (j === i ? { ...x, done: !x.done } : x)));
    if (online && item.id) {
      const c = await call(() => api.patchCart(item.id!, { done: !item.done }));
      if (c) setCart(c);
    }
  };

  const removeCart = async (i: number) => {
    const item = cart[i];
    if (!item) return;
    setCart(p => p.filter((_, j) => j !== i));
    if (online && item.id) {
      const c = await call(() => api.deleteCart(item.id!));
      if (c) setCart(c);
    }
  };

  const clearDone = async () => {
    setCart(p => p.filter(x => !x.done));
    if (online) {
      const c = await call(() => api.clearDone());
      if (c) setCart(c);
    }
    toast("Bahan yang sudah dibeli dihapus");
  };

  /* ---------------------------- expenses ---------------------------- */

  const logSpend = async (amount: number, recipeId?: number) => {
    if (online) {
      const ok = await call(() => api.addExpense(amount, recipeId && recipeId < 100000 ? recipeId : undefined));
      if (ok === null) return false;
      const st = await api.stats().catch(() => null);
      if (st) setServerStats(st);
    } else {
      setHistory(h => [...h, { date: todayISO(), amount, budget }]);
    }
    return true;
  };

  /* ---------------------------- community --------------------------- */

  const refreshPosts = async () => {
    if (!online || !user) return;
    const p = await api.posts().catch(() => null);
    if (p) setPosts(p);
  };

  const replacePost = (p: Post) => setPosts(l => l.map(x => (x.key === p.key ? p : x)));

  const addPost = async (p: {
    type: Post["type"];
    title: string;
    body: string;
    cost: number | null;
    cook_time: string | null;
    per_portion: string | null;
    image?: string;
  }) => {
    if (online) {
      const created = await call(() => api.createPost(p));
      if (!created) return false;
      setPosts(l => [created, ...l]);
      api.stats().then(setServerStats).catch(() => {});
    } else {
      const key = `u${Date.now()}`;
      setPosts(l => [
        {
          key,
          name: user?.name ?? "Kawan",
          campus: user?.campus?.split(",")[0] ?? "",
          time: "Baru saja",
          type: p.type,
          cost: p.cost ?? undefined,
          title: p.title,
          text: p.body,
          cookTime: p.cook_time ?? undefined,
          perPortion: p.per_portion ?? undefined,
          imageUrl: p.image ?? null,
          likes: 0,
          comments: 0,
          mine: true,
        },
        ...l,
      ]);
    }
    return true;
  };

  const react = async (key: string, kind: "like" | "save") => {
    const p = posts.find(x => x.key === key);
    if (!p) return;
    replacePost(kind === "like" ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : { ...p, saved: !p.saved });
    if (online && p.id) {
      const res = await call(() => (kind === "like" ? api.like(p.id!) : api.bookmark(p.id!)));
      replacePost(res ?? p);
    }
  };

  const getComments = async (key: string) => {
    const p = posts.find(x => x.key === key);
    if (online && p?.id) return (await call(() => api.comments(p.id!))) ?? [];
    return comments[key] ?? [];
  };

  const addComment = async (key: string, text: string) => {
    const p = posts.find(x => x.key === key);
    let list: Comment[] | null;
    if (online && p?.id) list = await call(() => api.comment(p.id!, text));
    else {
      list = [...(comments[key] ?? []), { id: Date.now(), author: user?.name ?? "Kawan", text, time: "Baru saja" }];
      setComments(c => ({ ...c, [key]: list! }));
    }
    if (list) setPosts(l => l.map(x => (x.key === key ? { ...x, comments: list!.length } : x)));
    return list;
  };

  const fetchSpots = async (tags: string[]): Promise<Spot[]> => {
    if (online) return (await call(() => api.spots(tags))) ?? [];
    return SPOTS.filter(s => tags.every(t => s.tags.includes(t)));
  };

  /* ------------------------------ stats ----------------------------- */

  const stats = useMemo<Stats | null>(() => {
    if (online) return serverStats;
    if (!user) return null;
    return offlineStats(history, savedRecipes.length, posts.filter(p => p.mine).length, cart.filter(c => c.done).length, pick);
  }, [online, serverStats, user, history, savedRecipes, posts, cart, pick]);

  return {
    ready,
    mode,
    user,
    stats,
    guest: !user || user.is_guest,
    budget,
    pick,
    shopB: user?.shop_budget ?? 35000,
    hist: (stats?.history ?? []).map(h => h.amount),
    saved,
    savedRecipes,
    cart,
    posts,
    today,
    results,
    tab,
    tabD,
    spot,

    register,
    login,
    loginGuest,
    logout,
    updateProfile: (patch: Partial<User>) => patchUser(patch, 0),
    // The +/- buttons, chips and slider stay inside the slider range.
    setBudget: (b: number) => patchUser({ daily_budget: Math.max(BUDGET_MIN, Math.min(BUDGET_MAX, Math.round(b))) }),
    // Onboarding sets the daily budget from a weekly amount, without the clamp.
    setWeekly: (week: number) => patchUser({ daily_budget: Math.round(week / 7) }),
    togglePick: (v: string) => patchUser({ prefs: toggle(pick, v) }),
    setShopBudget: (b: number) => patchUser({ shop_budget: Math.max(5000, b) }),

    generate,
    cachedRecipe,
    getRecipe,
    swapIngredient,
    toggleSaved,

    toggleCart,
    addToCart,
    addCartItem,
    removeCart,
    clearDone,
    logSpend,

    refreshPosts,
    addPost,
    toggleLike: (key: string) => react(key, "like"),
    toggleBookmark: (key: string) => react(key, "save"),
    getComments,
    addComment,
    fetchSpots,

    setTab,
    setTabD,
    toggleSpot: (v: string) => setSpot(p => toggle(p, v)),
  };
}

type Store = ReturnType<typeof useStoreValue>;

const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}
