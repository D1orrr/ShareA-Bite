import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useColorScheme, useWindowDimensions } from "react-native";

/* ------------------------------------------------------------------ */
/* Design tokens — mirrors the CSS custom properties of the HTML design */
/* ------------------------------------------------------------------ */

export const light = {
  paper: "#faf8ff",
  ink: "#131b2e",
  chili: "#006948", // primary
  sec: "#a73a00", // secondary (FAB, hearts)
  daun: "#006948", // "safe" green
  kunyit: "#ffb95f", // amber / warning
  sirup: "#f2f3ff", // soft surface
  mut: "#4a5850",
  card: "#ffffff",
  bd: "#dae2fd",
  ov: "#bccac0",
  err: "#ba1a1a",
  onp: "#ffffff",
  ons: "#ffffff",
  sh: "rgba(19,27,46,0.1)",
  pxl: "#006948", // big price numbers
  paperA: "rgba(250,248,255,0.92)", // translucent bars
};

export type Theme = typeof light;
export type Tok = keyof Theme;

export const dark: Theme = {
  paper: "#0d1322",
  ink: "#e6ebff",
  chili: "#68dba9",
  sec: "#ffb599",
  daun: "#68dba9",
  kunyit: "#ffb95f",
  sirup: "#1a2540",
  mut: "#a9b6ad",
  card: "#162036",
  bd: "#2a3550",
  ov: "#3d4b5e",
  err: "#ffb4ab",
  onp: "#002114",
  ons: "#370e00",
  sh: "rgba(0,0,0,0.5)",
  pxl: "#68dba9",
  paperA: "rgba(13,19,34,0.92)",
};

/** Tokens used inside the dark-green hero panel (budget card on Home). */
export const heroDark: Theme = {
  ...light,
  ink: "#ffffff",
  mut: "rgba(255,255,255,0.8)",
  paper: "#005137",
  chili: "#ffffff",
  onp: "#005137",
  card: "rgba(255,255,255,0.14)",
  bd: "rgba(255,255,255,0.25)",
  ov: "rgba(255,255,255,0.5)",
  sh: "rgba(0,0,0,0.2)",
  pxl: "#ffddb8",
};

/** Static colours that don't change between themes. */
export const C = {
  sticky: "#ffddb8",
  stickyInk: "#2a1700",
  avatar: "#85f8c4",
  avatarInk: "#002114",
  heroFrom: "#005137",
  heroTo: "#00855d",
  heroGlow: "#ffb95f",
  danger: "#C62828",
  pricePill: "rgba(40,48,68,0.88)",
  pricePillInk: "#eef0ff",
  mint: "#68dba9",
};

export const FONT = {
  jk5: "PlusJakartaSans_500Medium",
  jk6: "PlusJakartaSans_600SemiBold",
  jk7: "PlusJakartaSans_700Bold",
  vn4: "BeVietnamPro_400Regular",
  vn5: "BeVietnamPro_500Medium",
  vn6: "BeVietnamPro_600SemiBold",
  vn7: "BeVietnamPro_700Bold",
} as const;
export type FontKey = keyof typeof FONT;

/* ------------------------------------------------------------------ */
/* Theme context (system / manual dark mode + nested overrides)        */
/* ------------------------------------------------------------------ */

type Mode = "light" | "dark" | null; // null = follow system

interface ThemeCtx {
  t: Theme;
  isDark: boolean;
  toggleDark: () => void;
}

const Ctx = createContext<ThemeCtx>({ t: light, isDark: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<Mode>(null);
  const isDark = mode ? mode === "dark" : system === "dark";
  const value = useMemo<ThemeCtx>(
    () => ({ t: isDark ? dark : light, isDark, toggleDark: () => setMode(isDark ? "light" : "dark") }),
    [isDark]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Re-scope tokens for a subtree (e.g. the green hero panel). */
export function ThemeOverride({ theme, children }: { theme: Theme; children: ReactNode }) {
  const parent = useContext(Ctx);
  return <Ctx.Provider value={{ ...parent, t: theme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
export const useT = () => useContext(Ctx).t;

/** Resolve a token name or a raw colour string. */
export const col = (t: Theme, c?: Tok | string) => (c ? ((t as Record<string, string>)[c] ?? c) : undefined);

/* ------------------------------------------------------------------ */
/* Responsive helpers                                                  */
/* ------------------------------------------------------------------ */

export const MAX_W = 1120;

export function useLayout() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const pad = wide ? 48 : 16;
  const contentW = Math.min(width, MAX_W) - pad * 2;
  return { width, wide, pad, contentW };
}

export const clamp = (min: number, v: number, max: number) => Math.max(min, Math.min(max, v));
