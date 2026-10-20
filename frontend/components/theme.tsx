import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { dark, light, Palette } from "../constants/theme";

export type Flavor = "page" | "hero" | "heroLt";

type ThemeValue = {
  c: Palette;
  flavor: Flavor;
  dark: boolean;
  toggleDark: () => void;
};

type LayoutValue = { w: number; h: number; wide: boolean };

const ThemeContext = createContext<ThemeValue>({
  c: light,
  flavor: "page",
  dark: false,
  toggleDark: () => {},
});

const LayoutContext = createContext<LayoutValue>({ w: 390, h: 844, wide: false });

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const WIDE = 900;

export const nativeDriver = Platform.OS !== "web";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The first web render must match the pre-rendered HTML; real values apply after mount.
  const [mounted, setMounted] = useState(Platform.OS !== "web");
  useIsoLayoutEffect(() => setMounted(true), []);

  const system = useColorScheme();
  const [override, setOverride] = useState<"light" | "dark" | null>(null);
  const isDark = override ? override === "dark" : mounted && system === "dark";

  const dims = useWindowDimensions();
  const w = mounted ? dims.width : 390;
  const h = mounted ? dims.height : 844;

  const theme = useMemo<ThemeValue>(
    () => ({
      c: isDark ? dark : light,
      flavor: "page",
      dark: isDark,
      toggleDark: () => setOverride(isDark ? "light" : "dark"),
    }),
    [isDark]
  );
  const layout = useMemo(() => ({ w, h, wide: w >= WIDE }), [w, h]);

  return (
    <LayoutContext.Provider value={layout}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </LayoutContext.Provider>
  );
}

// Swaps the colors for everything inside, like the .hero class in the design.
export function ThemeScope({
  palette,
  flavor,
  children,
}: {
  palette: Palette;
  flavor: Flavor;
  children: ReactNode;
}) {
  const parent = useContext(ThemeContext);
  const value = useMemo(() => ({ ...parent, c: palette, flavor }), [parent, palette, flavor]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export const useLayout = () => useContext(LayoutContext);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => sub?.remove?.();
  }, []);
  return reduced;
}

const easeInOut = Easing.bezier(0.42, 0, 0.58, 1);

// 0 -> 1 -> 0 forever, eased both ways like the CSS keyframes.
export function useLoop(duration: number, run: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!run) {
      v.setValue(0);
      return;
    }
    const half = duration / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: half, easing: easeInOut, useNativeDriver: nativeDriver }),
        Animated.timing(v, { toValue: 0, duration: half, easing: easeInOut, useNativeDriver: nativeDriver }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [run, duration, v]);
  return v;
}

export function useCountUp(target: number, ms = 350) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const start = current.current;
    if (start === target) return;
    const t0 = Date.now();
    let frame = 0;
    const tick = () => {
      const q = Math.min(1, (Date.now() - t0) / ms);
      current.current = start + (target - start) * q;
      setValue(current.current);
      if (q < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return value;
}
