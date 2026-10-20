import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { CartItem, Recipe, START_CART } from "../constants/data";

export type RecipeTab = "Detail" | "Langkah" | "Nutrisi";

type State = {
  budget: number;
  hist: number[];
  pick: string[];
  saved: number[];
  liked: string[];
  tab: string;
  tabD: RecipeTab;
  spot: string[];
  shopB: number;
  guest: boolean;
  cart: CartItem[];
};

const START: State = {
  budget: 15000,
  hist: [12500, 9500, 14000, 8800, 11000, 7500],
  pick: ["Halal", "Pedas", "Rice cooker", "Kompor"],
  saved: [1],
  liked: [],
  tab: "Semua",
  tabD: "Detail",
  spot: ["Buka sekarang"],
  shopB: 35000,
  guest: false,
  cart: START_CART,
};

const toggle = <T,>(list: T[], v: T) =>
  list.includes(v) ? list.filter(x => x !== v) : [...list, v];

export const BUDGET_MIN = 5000;
export const BUDGET_MAX = 50000;

function useStoreValue() {
  const [s, set] = useState<State>(START);

  return useMemo(
    () => ({
      ...s,
      // The +/- buttons, chips and slider stay inside the slider range.
      setBudget: (b: number) =>
        set(p => ({ ...p, budget: Math.max(BUDGET_MIN, Math.min(BUDGET_MAX, b)) })),
      // Onboarding sets the daily budget from a weekly amount, without the clamp.
      setWeekly: (week: number) => set(p => ({ ...p, budget: week / 7 })),
      togglePick: (v: string) => set(p => ({ ...p, pick: toggle(p.pick, v) })),
      // Returns true when the recipe is now saved.
      toggleSaved: (id: number) => {
        const nowSaved = !s.saved.includes(id);
        set(p => ({ ...p, saved: toggle(p.saved, id) }));
        return nowSaved;
      },
      toggleLiked: (k: string) => set(p => ({ ...p, liked: toggle(p.liked, k) })),
      setTab: (tab: string) => set(p => ({ ...p, tab })),
      setTabD: (tabD: RecipeTab) => set(p => ({ ...p, tabD })),
      toggleSpot: (v: string) => set(p => ({ ...p, spot: toggle(p.spot, v) })),
      setGuest: (guest: boolean) => set(p => ({ ...p, guest })),
      toggleCart: (i: number) =>
        set(p => ({
          ...p,
          cart: p.cart.map((x, j) => (j === i ? { ...x, done: !x.done } : x)),
        })),
      // Same ingredient and unit adds up instead of making a second row.
      addToCart: (r: Recipe) =>
        set(p => {
          const cart = p.cart.map(x => ({ ...x }));
          for (const x of r.ing) {
            const match = cart.find(c => c.name === x.name && c.unit === x.unit);
            if (match) {
              match.qty += x.qty;
              match.price += x.price;
            } else {
              cart.push({ name: x.name, qty: x.qty, unit: x.unit, price: x.price, cat: x.cat, done: false });
            }
          }
          return { ...p, cart };
        }),
      logSpend: (amount: number) => set(p => ({ ...p, hist: [...p.hist, amount] })),
    }),
    [s]
  );
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
