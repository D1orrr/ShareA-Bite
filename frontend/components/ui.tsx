/**
 * Core UI primitives for the ShareA'Bite design system.
 * Each maps 1:1 to a CSS class in the original HTML design (.btn, .chip, .card, …).
 */
import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop, Circle } from "react-native-svg";
import { C, FONT, FontKey, ThemeOverride, Tok, clamp, col, heroDark, useLayout, useT } from "../theme";

const ND = Platform.OS !== "web"; // useNativeDriver

/** Unique, SVG-safe id for gradients/patterns. */
let _uid = 0;
export const useSvgId = (p: string) => useRef(`${p}${++_uid}`).current;

/* ------------------------------- Text -------------------------------- */

type Variant = "d" | "h1" | "h2" | "h3" | "body" | "cap" | "pxl" | "lbl";

export interface TxtProps extends TextProps {
  v?: Variant;
  f?: FontKey;
  s?: number;
  c?: Tok | string;
  num?: boolean; // tabular numbers
  center?: boolean;
  strike?: boolean;
  style?: StyleProp<TextStyle>;
}

export function Txt({ v = "body", f, s, c, num, center, strike, style, children, ...rest }: TxtProps) {
  const t = useT();
  const { wide, width } = useLayout();
  const base: Record<Variant, TextStyle> = {
    d: { fontFamily: FONT.jk7, fontSize: clamp(36, width * 0.06, 56), color: t.ink },
    h1: { fontFamily: FONT.jk7, fontSize: wide ? clamp(26, width * 0.034, 36) : 26, color: t.ink },
    h2: { fontFamily: FONT.jk7, fontSize: 22, color: t.ink },
    h3: { fontFamily: FONT.jk6, fontSize: 17, color: t.ink },
    body: { fontFamily: FONT.vn4, fontSize: 15, color: t.ink },
    cap: { fontFamily: FONT.vn4, fontSize: 13, color: t.mut },
    pxl: { fontFamily: FONT.jk7, fontSize: clamp(46, width * 0.09, 84), color: t.pxl },
    lbl: { fontFamily: FONT.jk7, fontSize: 12, color: t.ink },
  };
  const st: TextStyle = { ...base[v] };
  if (f) st.fontFamily = FONT[f];
  if (s) st.fontSize = s;
  if (c) st.color = col(t, c);
  const size = st.fontSize as number;
  const lh = v === "d" ? 1.12 : v === "pxl" ? 1 : v.startsWith("h") ? 1.25 : 1.5;
  st.lineHeight = Math.round(size * lh);
  if (v === "d" || v.startsWith("h")) st.letterSpacing = -0.02 * size;
  if (v === "pxl") st.letterSpacing = -0.04 * size;
  if (num || v === "pxl") st.fontVariant = ["tabular-nums"];
  if (center) st.textAlign = "center";
  if (strike) st.textDecorationLine = "line-through";
  return (
    <Text {...rest} style={[st, style]}>
      {children}
    </Text>
  );
}

/** Big price number (`.pxl`) that shrinks to fit its container's width. */
export function FitPxl({ children, c, s, style }: { children: string; c?: Tok | string; s?: number; style?: StyleProp<ViewStyle> }) {
  const { width } = useLayout();
  const [w, setW] = useState(0);
  const base = s ?? clamp(46, width * 0.09, 84);
  const size = w ? Math.min(base, w / (children.length * 0.6)) : base;
  return (
    <View style={style} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Txt v="pxl" s={size} c={c} numberOfLines={1} accessibilityLiveRegion="polite">
        {children}
      </Txt>
    </View>
  );
}

/* ------------------------------- Icon -------------------------------- */

const ICONS = {
  home: ["explore", "explore"],
  bookmark: ["bookmark-border", "bookmark"],
  cart: ["shopping-bag", "shopping-bag"],
  users: ["forum", "forum"],
  user: ["account-circle", "account-circle"],
  heart: ["favorite-border", "favorite"],
  spark: ["auto-awesome", "auto-awesome"],
  back: ["arrow-back", "arrow-back"],
  clock: ["schedule", "schedule"],
  plus: ["add", "add"],
  pin: ["pin-drop", "pin-drop"],
  msg: ["chat-bubble-outline", "chat-bubble"],
  share: ["share", "share"],
  check: ["check", "check"],
  x: ["close", "close"],
  bell: ["notifications-none", "notifications"],
  search: ["search", "search"],
  payments: ["payments", "payments"],
  paid: ["paid", "paid"],
  location: ["location-on", "location-on"],
  premium: ["workspace-premium", "workspace-premium"],
  fire: ["local-fire-department", "local-fire-department"],
  basket: ["shopping-basket", "shopping-basket"],
  photo: ["add-a-photo", "add-a-photo"],
  tune: ["tune", "tune"],
} as const;
export type IconName = keyof typeof ICONS;

export function Icon({ n, fill, size = 22, c }: { n: IconName; fill?: boolean; size?: number; c?: Tok | string }) {
  const t = useT();
  return <MaterialIcons name={ICONS[n][fill ? 1 : 0]} size={size} color={col(t, c) ?? t.ink} />;
}

/* ------------------------------ Layout ------------------------------- */

export function Row({
  children,
  gap = 10,
  wrap,
  sp,
  align = "center",
  style,
}: {
  children?: ReactNode;
  gap?: number;
  wrap?: boolean;
  sp?: boolean;
  align?: ViewStyle["alignItems"];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        { flexDirection: "row", alignItems: align, gap, flexWrap: wrap ? "wrap" : "nowrap", justifyContent: sp ? "space-between" : "flex-start" },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Col({ children, gap = 14, style }: { children?: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

/** Scrollable page body (`.view`). Fades in on mount. */
export function Screen({ children, focus, scroll = true }: { children: ReactNode; focus?: boolean; scroll?: boolean }) {
  const t = useT();
  const { wide, pad } = useLayout();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 350, useNativeDriver: ND }).start();
  }, [a]);
  const inner = (
    <Animated.View
      style={{
        width: "100%",
        maxWidth: 1120,
        alignSelf: "center",
        paddingHorizontal: pad,
        paddingTop: wide ? 36 : 16,
        paddingBottom: focus ? 48 : wide ? 80 : 120,
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
  if (!scroll) return <View style={{ flex: 1, backgroundColor: t.paper }}>{inner}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {inner}
    </ScrollView>
  );
}

/** Two-column layout on desktop, stacked on mobile (`.two` / `.two.r`). */
export function Two({ children, r, align }: { children: [ReactNode, ReactNode]; r?: boolean; align?: ViewStyle["alignItems"] }) {
  const { wide } = useLayout();
  if (!wide) return <View style={{ gap: 28 }}>{children}</View>;
  return (
    <View style={{ flexDirection: "row", gap: 44, alignItems: align ?? "flex-start" }}>
      <View style={{ flex: r ? 1.6 : 1.1, minWidth: 0 }}>{children[0]}</View>
      <View style={{ flex: 1, minWidth: 0 }}>{children[1]}</View>
    </View>
  );
}

/** Responsive auto-fill grid (`.grid`, min column 310px). */
export function Grid({ children, min = 310, gap = 16 }: { children: ReactNode; min?: number; gap?: number }) {
  const { contentW } = useLayout();
  const cols = Math.max(1, Math.floor((contentW + gap) / (min + gap)));
  const w = (contentW - gap * (cols - 1)) / cols;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
      {React.Children.toArray(children).map((c, i) => (
        <View key={i} style={{ width: cols === 1 ? "100%" : w }}>
          {c}
        </View>
      ))}
    </View>
  );
}

/* ------------------------------ Surfaces ----------------------------- */

export function Card({
  children,
  style,
  torn,
  flat,
  onPress,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  torn?: boolean;
  flat?: boolean;
  onPress?: () => void;
}) {
  const t = useT();
  const s: StyleProp<ViewStyle> = [
    { backgroundColor: t.card, borderRadius: 12, padding: 16, boxShadow: flat ? undefined : `0 1px 3px ${t.sh}` },
    torn && { marginBottom: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    style,
  ];
  const content = (
    <>
      {children}
      {torn ? <TornEdge color={t.card} /> : null}
    </>
  );
  if (onPress)
    return (
      <Pressable onPress={onPress} style={s}>
        {content}
      </Pressable>
    );
  return <View style={s}>{content}</View>;
}

/** Zig-zag "torn receipt" bottom edge. */
function TornEdge({ color }: { color: string }) {
  const id = useSvgId("torn");
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: -7, height: 7 }}>
      <Svg width="100%" height={7}>
        <Defs>
          <Pattern id={id} x={0} y={0} width={12} height={7} patternUnits="userSpaceOnUse">
            <Path d="M0 0 L6 7 L12 0 Z" fill={color} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height={7} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Green gradient hero panel; re-scopes theme tokens to white-on-green. `light` = soft lilac panel. */
export function Hero({ children, light, style }: { children: ReactNode; light?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useT();
  const { width } = useLayout();
  const id = useSvgId("hero");
  const padding = clamp(20, width * 0.04, 36);
  if (light) return <View style={[{ backgroundColor: t.sirup, borderRadius: 16, padding }, style]}>{children}</View>;
  return (
    <View style={[{ borderRadius: 16, padding, overflow: "hidden", boxShadow: "0 20px 40px -22px rgba(0,105,72,0.7)" }, style]}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={C.heroFrom} />
              <Stop offset="1" stopColor={C.heroTo} />
            </LinearGradient>
            <RadialGradient id={`${id}r`} cx="92%" cy="0%" r="45%" fx="92%" fy="0%">
              <Stop offset="0" stopColor={C.heroGlow} stopOpacity={0.35} />
              <Stop offset="1" stopColor={C.heroGlow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}l)`} />
          <Rect width="100%" height="100%" fill={`url(#${id}r)`} />
        </Svg>
      </View>
      <ThemeOverride theme={heroDark}>{children}</ThemeOverride>
    </View>
  );
}

export function Sticky({ children, style, size = 15 }: { children: ReactNode; style?: StyleProp<ViewStyle>; size?: number }) {
  return (
    <View style={[{ backgroundColor: C.sticky, borderRadius: 12, padding: 16 }, style]}>
      {typeof children === "string" ? (
        <Txt f="vn5" s={size} c={C.stickyInk}>
          {children}
        </Txt>
      ) : (
        children
      )}
    </View>
  );
}

/* ------------------------------ Controls ----------------------------- */

export function Btn({
  title,
  icon,
  onPress,
  ghost,
  size = "md",
  full,
  grow,
  style,
  label,
  bg,
  fg,
}: {
  title?: string;
  icon?: IconName;
  onPress?: () => void;
  ghost?: boolean;
  size?: "s" | "md" | "xl";
  full?: boolean;
  grow?: boolean;
  style?: StyleProp<ViewStyle>;
  label?: string;
  bg?: string;
  fg?: string;
}) {
  const t = useT();
  const h = { s: 40, md: 52, xl: 60 }[size];
  const fs = { s: 13, md: 15, xl: 17 }[size];
  const color = fg ?? (ghost ? t.ink : t.onp);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      style={({ pressed }) => [
        {
          minHeight: h,
          paddingHorizontal: size === "s" ? 16 : 26,
          borderRadius: 99,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: bg ?? (ghost ? "transparent" : t.chili),
          borderWidth: ghost ? 1.5 : 0,
          borderColor: t.ov,
          boxShadow: ghost ? undefined : `0 1px 3px ${t.sh}`,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        full && { alignSelf: "stretch" },
        grow && { flex: 1 },
        style,
      ]}
    >
      {icon ? <Icon n={icon} c={color} size={size === "s" ? 18 : 22} /> : null}
      {title ? (
        <Txt f="jk7" s={fs} c={color} center>
          {title}
        </Txt>
      ) : null}
    </Pressable>
  );
}

/** Round icon button (`.ib`, and the white circle buttons over images). */
export function IconBtn({
  n,
  fill,
  onPress,
  label,
  c,
  bg,
  size = 44,
  style,
}: {
  n: IconName;
  fill?: boolean;
  onPress?: () => void;
  label: string;
  c?: Tok | string;
  bg?: Tok | string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: col(t, bg) ?? "transparent", opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Icon n={n} fill={fill} c={c ?? "mut"} />
    </Pressable>
  );
}

export function Chip({
  label,
  on,
  onPress,
  sw,
  round,
  style,
  children,
}: {
  label?: string;
  on?: boolean;
  onPress?: () => void;
  sw?: boolean;
  /** Pill-shaped toggle with a check mark — used for preference filters. */
  round?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const t = useT();
  const bg = sw ? hexA(t.chili, 0.14) : on ? t.chili : t.card;
  const fg = sw ? t.chili : on ? t.onp : t.mut;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      style={({ pressed }) => [
        {
          minHeight: sw ? 28 : 36,
          paddingHorizontal: sw ? 10 : 14,
          borderRadius: round ? 99 : 8,
          borderWidth: round ? 1 : 0,
          borderColor: on ? bg : t.ov,
          backgroundColor: round && !on ? "transparent" : bg,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          boxShadow: sw ? undefined : `0 1px 2px ${t.sh}`,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {round && on ? <Icon n="check" size={16} c={fg} /> : null}
      {children ?? (
        <Txt f="jk6" s={sw ? 11.5 : 12.5} c={round && !on ? t.ink : fg} numberOfLines={1}>
          {label}
        </Txt>
      )}
    </Pressable>
  );
}

/** Set of toggle chips. */
export function Chips({ items, isOn, onToggle, round }: { items: string[]; isOn: (x: string) => boolean; onToggle: (x: string) => void; round?: boolean }) {
  return (
    <Row wrap gap={round ? 8 : 10}>
      {items.map((x) => (
        <Chip key={x} label={x} on={isOn(x)} round={round} onPress={() => onToggle(x)} />
      ))}
    </Row>
  );
}

/** Small rounded status label (`.stamp` / `.bdg`). */
export function Stamp({
  label,
  bad,
  color,
  bg,
  size = 11,
  style,
}: {
  label: string;
  bad?: boolean;
  color?: Tok | string;
  bg?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useT();
  const c = col(t, color) ?? (bad ? t.err : t.daun);
  return (
    <View style={[{ backgroundColor: bg ?? hexA(c, 0.15), paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, alignSelf: "flex-start" }, style]}>
      <Txt f="jk7" s={size} c={c} style={{ letterSpacing: 0.04 * size }} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

/** Progress bar (`.bar`), width animates on change. */
export function Bar({ pct, color, h = 10, style }: { pct: number; color?: Tok | string; h?: number; style?: StyleProp<ViewStyle> }) {
  const t = useT();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: clamp(0, pct, 100), duration: 600, useNativeDriver: false }).start();
  }, [pct, a]);
  return (
    <View style={[{ height: h, borderRadius: 9, backgroundColor: t.bd, overflow: "hidden" }, style]}>
      <Animated.View
        style={{
          height: "100%",
          borderRadius: 9,
          backgroundColor: col(t, color) ?? t.chili,
          width: a.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        }}
      />
    </View>
  );
}

/** Circular score ring (`.ring`). */
export function Ring({ p, size = 44, stroke = 5, fs = 12 }: { p: number; size?: number; stroke?: number; fs?: number }) {
  const t = useT();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.bd} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.daun}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${(circ * p) / 100} ${circ}`}
        />
      </Svg>
      <Txt f="jk7" s={fs} num>
        {p}
      </Txt>
    </View>
  );
}

export function Avatar({ letter, size = 44, bg, fg, children }: { letter?: string; size?: number; bg?: string; fg?: string; children?: ReactNode }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg ?? C.avatar, alignItems: "center", justifyContent: "center" }}>
      {children ?? (
        <Txt f="jk7" s={Math.round(size * 0.37)} c={fg ?? C.avatarInk}>
          {letter}
        </Txt>
      )}
    </View>
  );
}

/** Round check bubble (`.ck`). */
export function Check({ on }: { on: boolean }) {
  const t = useT();
  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: on ? t.daun : t.ov,
        backgroundColor: on ? t.daun : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {on ? <Icon n="check" size={18} c="onp" /> : null}
    </View>
  );
}

/** Segmented control (`.pill`). */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  labels,
  style,
}: {
  items: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Partial<Record<T, string>>;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useT();
  return (
    <View style={[{ flexDirection: "row", gap: 4, padding: 4, backgroundColor: t.bd, borderRadius: 12, width: "100%", maxWidth: 480 }, style]}>
      {items.map((x) => {
        const on = x === value;
        return (
          <Pressable
            key={x}
            onPress={() => onChange(x)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, minHeight: 42, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: on ? t.card : "transparent", boxShadow: on ? `0 1px 3px ${t.sh}` : undefined }}
          >
            <Txt f="jk7" s={13} c={on ? "ink" : "mut"}>
              {labels?.[x] ?? x}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Input({ style, ...p }: TextInputProps & { style?: StyleProp<TextStyle> }) {
  const t = useT();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={t.mut}
      {...p}
      onFocus={(e) => {
        setFocus(true);
        p.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        p.onBlur?.(e);
      }}
      style={[
        {
          width: "100%",
          minHeight: 46,
          paddingHorizontal: 14,
          borderRadius: 8,
          backgroundColor: t.card,
          color: t.ink,
          fontFamily: FONT.vn4,
          fontSize: 15,
          boxShadow: focus ? `0 0 0 2px ${t.chili}` : `0 1px 2px ${t.sh}`,
          outlineWidth: 0,
        },
        style,
      ]}
    />
  );
}

/**
 * Lightweight range slider (no native dependency) for the budget picker.
 */
export function Slider({
  min,
  max,
  step,
  value,
  onChange,
  label,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const t = useT();
  const w = useRef(0);
  const startX = useRef(0);
  const cb = useRef(onChange);
  cb.current = onChange;
  const toVal = (x: number) => {
    const q = clamp(0, x / (w.current || 1), 1);
    return clamp(min, Math.round((min + q * (max - min)) / step) * step, max);
  };
  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        startX.current = e.nativeEvent.locationX;
        cb.current(toVal(startX.current));
      },
      onPanResponderMove: (_, g) => cb.current(toVal(startX.current + g.dx)),
    })
  ).current;
  const q = (value - min) / (max - min);
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => onChange(clamp(min, value + (e.nativeEvent.actionName === "increment" ? step : -step), max))}
      onLayout={(e) => (w.current = e.nativeEvent.layout.width)}
      style={{ height: 34, justifyContent: "center" }}
      {...pr.panHandlers}
    >
      <View pointerEvents="none" style={{ height: 6, borderRadius: 3, backgroundColor: t.bd }}>
        <View style={{ height: 6, borderRadius: 3, width: `${q * 100}%`, backgroundColor: t.kunyit }} />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: `${q * 100}%`,
          marginLeft: -11,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: t.kunyit,
          borderWidth: 3,
          borderColor: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </View>
  );
}

/* ---------------------------- Receipt bits ---------------------------- */

/** "Name ........ Rp9.500" receipt line (`.lr`). */
export function Line({ left, right, bold, big }: { left: ReactNode; right: ReactNode; bold?: boolean; big?: boolean }) {
  const t = useT();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingVertical: 4 }}>
      <Txt f={bold ? "vn7" : "vn5"} s={14} num>
        {left}
      </Txt>
      <View style={{ flex: 1, overflow: "hidden", height: 14, marginBottom: 4 }}>
        <Txt s={14} c={t.ov} numberOfLines={1} style={{ lineHeight: 14, letterSpacing: 2 }}>
          {"·".repeat(80)}
        </Txt>
      </View>
      <Txt f="vn7" s={big ? 18 : 14} c={big ? "chili" : "ink"} num>
        {right}
      </Txt>
    </View>
  );
}

/** Decorative receipt barcode (`.bc`). */
export function Barcode() {
  const t = useT();
  const id = useSvgId("bc");
  return (
    <View style={{ height: 28, opacity: 0.7 }}>
      <Svg width="100%" height={28}>
        <Defs>
          <Pattern id={id} x={0} y={0} width={14} height={28} patternUnits="userSpaceOnUse">
            <Rect x={0} width={2} height={28} fill={t.ink} />
            <Rect x={4} width={1} height={28} fill={t.ink} />
            <Rect x={9} width={3} height={28} fill={t.ink} />
          </Pattern>
        </Defs>
        <Rect width="100%" height={28} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Dashed divider. */
export function Dashed({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useT();
  return <View style={[{ borderTopWidth: 2, borderStyle: "dashed", borderColor: t.mut }, style]} />;
}

/* ------------------------------- Utils -------------------------------- */

/** Apply alpha to a #rrggbb colour (pass-through for rgba/other). */
export function hexA(c: string, a: number) {
  if (!c.startsWith("#") || c.length !== 7) return c;
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Animate a number towards `target` (budget count-up). */
export function useCountUp(target: number, ms = 350) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const a = from.current;
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const q = Math.min(1, (Date.now() - t0) / ms);
      const cur = a + (target - a) * q;
      setV(cur);
      from.current = cur;
      if (q < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
