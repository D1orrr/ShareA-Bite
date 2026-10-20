import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import {
  CartItem,
  INITIAL_CART,
  INITIAL_HISTORY,
  INITIAL_POSTS,
  Post,
  Recipe,
} from "../data/seed";
import { FONT, useT } from "../theme";

/**
 * Client-side app state. Everything here is in-memory mock state until the
 * FastAPI backend grows real endpoints (recipes, cart, posts, expenses).
 */
interface AppState {
  budget: number;
  setBudget: (b: number) => void;
  history: number[];
  logSpend: (amount: number) => void;
  prefs: string[];
  togglePref: (p: string) => void;
  saved: number[];
  toggleSaved: (id: number) => void;
  liked: string[];
  toggleLiked: (key: string) => void;
  cart: CartItem[];
  toggleCartItem: (index: number) => void;
  addRecipeToCart: (r: Recipe) => void;
  posts: Post[];
  addPost: (p: Omit<Post, "id" | "likes" | "comments" | "time">) => void;
  guest: boolean;
  setGuest: (g: boolean) => void;
  toast: (msg: string) => void;
}

const Ctx = createContext<AppState | undefined>(undefined);

export const BUDGET_MIN = 5000;
export const BUDGET_MAX = 50000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [budget, _setBudget] = useState(15000);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [prefs, setPrefs] = useState<string[]>(["Halal", "Pedas", "Rice cooker", "Kompor"]);
  const [saved, setSaved] = useState<number[]>([1]);
  const [liked, setLiked] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [guest, setGuest] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastKey, setToastKey] = useState(0);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    setToastKey((k) => k + 1);
  }, []);

  const value: AppState = {
    budget,
    setBudget: (b) => _setBudget(Math.max(BUDGET_MIN, Math.min(BUDGET_MAX, Math.round(b)))),
    history,
    logSpend: (a) => setHistory((h) => [...h, a]),
    prefs,
    togglePref: (p) => setPrefs((l) => toggle(l, p)),
    saved,
    toggleSaved: (id) => {
      const had = saved.includes(id);
      setSaved((l) => toggle(l, id));
      toast(had ? "Dihapus dari Simpan" : "Tersimpan. Hemat banget!");
    },
    liked,
    toggleLiked: (k) => setLiked((l) => toggle(l, k)),
    cart,
    toggleCartItem: (i) => setCart((c) => c.map((x, j) => (j === i ? { ...x, done: !x.done } : x))),
    addRecipeToCart: (r) => {
      setCart((c) => {
        const next = c.map((x) => ({ ...x }));
        r.ingredients.forEach((ing) => {
          const m = next.find((x) => x.name === ing.name && x.unit === ing.unit);
          if (m) {
            m.qty += ing.qty;
            m.price += ing.price;
            m.done = false;
          } else next.push({ name: ing.name, qty: ing.qty, unit: ing.unit, price: ing.price, cat: ing.cat, done: false });
        });
        return next;
      });
      toast("Bahan masuk ke Belanja");
    },
    posts,
    addPost: (p) =>
      setPosts((l) => [{ ...p, id: `u${Date.now()}`, likes: 0, comments: 0, time: "Baru saja" }, ...l]),
    guest,
    setGuest,
    toast,
  };

  return (
    <Ctx.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <Toast msg={toastMsg} k={toastKey} />
      </View>
    </Ctx.Provider>
  );
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
};

/* Pill toast that slides up from the bottom, like `.toast` in the design. */
function Toast({ msg, k }: { msg: string; k: number }) {
  const t = useT();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!k) return;
    a.stopAnimation();
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== "web" }),
      Animated.delay(1600),
      Animated.timing(a, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
  }, [k, a]);
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <Animated.View
        accessibilityRole="alert"
        style={[
          styles.toast,
          { backgroundColor: t.ink, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] },
        ]}
      >
        <Text style={{ color: t.paper, fontFamily: FONT.jk6, fontSize: 14 }}>{msg}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrap: { position: "absolute", left: 0, right: 0, bottom: 92, alignItems: "center", zIndex: 90 },
  toast: { paddingVertical: 12, paddingHorizontal: 22, borderRadius: 99, maxWidth: "90%" },
});
