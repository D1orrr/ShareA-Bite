import type { Recipe } from "../data/seed";

/** Format a number as Indonesian Rupiah, e.g. 15000 -> "Rp15.000". */
export const R = (n: number) =>
  (n < 0 ? "-" : "") + "Rp" + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Total ingredient cost of a recipe. */
export const cost = (r: Recipe) => r.ingredients.reduce((a, x) => a + x.price, 0);

export type BudgetStatus = { color: "err" | "kunyit" | "daun"; label: string };

/** Wallet status for `used` out of `budget`. */
export const budgetStatus = (used: number, budget: number): BudgetStatus => {
  const q = used / budget;
  if (q > 1) return { color: "err", label: "Lewat budget" };
  if (q > 0.7) return { color: "kunyit", label: "Hampir habis" };
  return { color: "daun", label: "Dompet aman" };
};

/** "mm:ss" for a duration in seconds. */
export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Keep only digits from user input and parse. */
export const digits = (s: string) => +s.replace(/\D/g, "") || 0;
