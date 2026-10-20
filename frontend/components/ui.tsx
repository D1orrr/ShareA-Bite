import React, { ReactNode, useEffect, useId, useRef, useState } from "react";
import {
  Animated,
  DimensionValue,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { alpha, amountEm, clamp, fixed, font, hero, heroLt } from "../constants/theme";
import { Icon, IconName } from "./Icon";
import { ThemeScope, useLayout, useTheme } from "./theme";

export const row: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10 };
export const wrap: ViewStyle = { flexWrap: "wrap" };
export const between: ViewStyle = { justifyContent: "space-between" };

const svgId = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "");

type BtnProps = {
  title?: string;
  children?: ReactNode;
  onPress?: () => void;
  ghost?: boolean;
  size?: "s" | "xl";
  full?: boolean;
  grow?: boolean;
  icon?: IconName;
  bg?: string;
  fg?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Btn({ title, children, onPress, ghost, size, full, grow, icon, bg, fg, label, style, textStyle }: BtnProps) {
  const { c } = useTheme();
  const color = fg ?? (ghost ? c.ink : c.onp);
  const fontSize = size === "s" ? 13 : size === "xl" ? 17 : 15;
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: size === "s" ? 40 : size === "xl" ? 60 : 52,
          paddingHorizontal: size === "s" ? 16 : 26,
          borderRadius: 99,
          backgroundColor: ghost ? "transparent" : bg ?? c.chili,
        },
        ghost ? { borderWidth: 1.5, borderColor: c.ov } : { boxShadow: `0 1px 3px ${c.sh}` },
        full && { alignSelf: "stretch" },
        grow && { flex: 1, minWidth: 0 },
        pressed && { transform: [{ scale: 0.96 }] },
        style,
      ]}
    >
      {icon ? <Icon name={icon} color={color} /> : null}
      {title !== undefined ? (
        <Text style={[{ fontFamily: font.head, fontSize, color, textAlign: "center", flexShrink: 1 }, textStyle]}>
          {title}
        </Text>
      ) : null}
      {children}
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  on?: boolean;
  onPress?: () => void;
  // Small tinted chip, like .chip.sw.
  sw?: boolean;
  kind?: "radio" | "checkbox";
  bg?: string;
  fg?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Chip({ label, on, onPress, sw, kind, bg, fg, style, textStyle }: ChipProps) {
  const { c, flavor } = useTheme();
  let background = on ? c.chili : c.card;
  let color = on ? c.onp : c.mut;
  let shadow: string | undefined = `0 1px 2px ${c.sh}`;
  if (flavor === "hero") {
    shadow = undefined;
    if (!on) {
      background = "rgba(255,255,255,0.14)";
      color = "#ffffff";
    }
  }
  if (sw) {
    background = alpha(c.chili, 0.14);
    color = c.chili;
    shadow = undefined;
  }
  const box: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 6,
    minHeight: sw ? 28 : 36,
    paddingHorizontal: sw ? 10 : 14,
    borderRadius: 8,
    backgroundColor: bg ?? background,
    boxShadow: shadow,
  };
  const text = (
    <Text style={[{ fontFamily: font.headSemi, fontSize: sw ? 11.5 : 12.5, color: fg ?? color, flexShrink: 1 }, textStyle]}>
      {label}
    </Text>
  );
  if (!onPress) return <View style={[box, style]}>{text}</View>;
  return (
    <Pressable
      role={kind ?? "button"}
      aria-checked={kind ? !!on : undefined}
      onPress={onPress}
      // The chip is drawn 36px tall; this makes the touch area 44px.
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [box, pressed && { opacity: 0.85 }, style]}
    >
      {text}
    </Pressable>
  );
}

export function Stamp({
  label,
  bad,
  color,
  bg,
  size = 11,
  rotate,
  style,
}: {
  label: string;
  bad?: boolean;
  color?: string;
  bg?: string;
  size?: number;
  rotate?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, flavor } = useTheme();
  const tone = bad ? c.err : c.daun;
  // A light tint is unreadable on the green panel, so the pill goes dark there.
  const tint = flavor === "hero" ? "rgba(0,33,20,0.55)" : alpha(tone, bad ? 0.14 : 0.15);
  return (
    <View
      style={[
        {
          backgroundColor: bg ?? tint,
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 99,
        },
        rotate ? { transform: [{ rotate }] } : null,
        style,
      ]}
    >
      <Text style={{ fontFamily: font.head, fontSize: size, letterSpacing: 0.04 * size, color: color ?? tone }}>
        {label}
      </Text>
    </View>
  );
}

function TornEdge({ color }: { color: string }) {
  const id = "torn" + svgId(useId());
  return (
    <Svg aria-hidden width="100%" height={7} style={{ position: "absolute", left: 0, right: 0, bottom: -7 }}>
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={12} height={7}>
          <Path d="M0 0H12V7H9.5L6 3.5L2.5 7H0Z" fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height={7} fill={`url(#${id})`} />
    </Svg>
  );
}

export function Card({
  children,
  style,
  torn,
  flat,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  torn?: boolean;
  // No shadow.
  flat?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: c.card, borderRadius: 12, padding: 16 },
        !flat && { boxShadow: `0 1px 3px ${c.sh}` },
        torn && { marginBottom: 8 },
        style,
      ]}
    >
      {children}
      {torn ? <TornEdge color={c.card} /> : null}
    </View>
  );
}

export function Barcode({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const id = "bc" + svgId(useId());
  return (
    <View style={[{ height: 28, opacity: 0.7 }, style]}>
      <Svg aria-hidden width="100%" height={28}>
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={14} height={28}>
            <Rect x={0} width={2} height={28} fill={c.ink} />
            <Rect x={4} width={1} height={28} fill={c.ink} />
            <Rect x={9} width={3} height={28} fill={c.ink} />
          </Pattern>
        </Defs>
        <Rect width="100%" height={28} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function Ring({ p, size = 44, inner = 34, fontSize = 12 }: { p: number; size?: number; inner?: number; fontSize?: number }) {
  const { c } = useTheme();
  const sw = (size - inner) / 2;
  const r = (size - sw) / 2;
  const C = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <View
      role="img"
      aria-label={`Skor nutrisi ${p}`}
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={mid} cy={mid} r={r} stroke={c.bd} strokeWidth={sw} fill={c.card} />
        <Circle
          cx={mid}
          cy={mid}
          r={r}
          stroke={c.daun}
          strokeWidth={sw}
          fill="none"
          strokeDasharray={`${(C * p) / 100} ${C}`}
          transform={`rotate(-90 ${mid} ${mid})`}
        />
      </Svg>
      <Text style={{ fontFamily: font.head, fontSize, color: c.ink }}>{p}</Text>
    </View>
  );
}

export function Bar({
  pct,
  color,
  height = 10,
  label,
  style,
}: {
  pct: number;
  color: string;
  height?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const v = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct, v]);
  return (
    <View
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuenow={label ? Math.round(pct) : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      style={[{ height, borderRadius: 9, backgroundColor: c.bd, overflow: "hidden" }, style]}
    >
      <Animated.View
        style={{
          height: "100%",
          borderRadius: 9,
          backgroundColor: color,
          width: v.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"], extrapolate: "clamp" }),
        }}
      />
    </View>
  );
}

// Clipped from a full border because iOS can't draw a dotted border on one side.
export function Rule({
  color,
  dashed,
  width = 2,
  style,
}: {
  color: string;
  dashed?: boolean;
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ height: width, overflow: "hidden" }, style]}>
      <View
        style={{
          height: width * 3,
          marginHorizontal: -width,
          borderWidth: width,
          borderColor: color,
          borderStyle: dashed ? "dashed" : "dotted",
        }}
      />
    </View>
  );
}

export function LineRow({
  label,
  value,
  labelBold,
  valueStyle,
  style,
}: {
  label: ReactNode;
  value: ReactNode;
  labelBold?: boolean;
  valueStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const t: TextStyle = {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    lineHeight: 18,
    color: c.ink,
    fontVariant: ["tabular-nums"],
  };
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingVertical: 4 }, style]}>
      <Text style={[t, { flexShrink: 1 }, labelBold && { fontFamily: font.bodyBold }]}>{label}</Text>
      <Rule color={c.ov} style={{ flex: 1, minWidth: 12, marginBottom: 6 }} />
      <Text style={[t, { fontFamily: font.bodyBold }, valueStyle]}>{value}</Text>
    </View>
  );
}

export function Pill<T extends string>({
  options,
  value,
  onChange,
  maxWidth = 480,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  maxWidth?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View
      role="tablist"
      style={[
        { flexDirection: "row", gap: 4, padding: 4, backgroundColor: c.bd, borderRadius: 12, width: "100%", maxWidth },
        style,
      ]}
    >
      {options.map(o => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            role="tab"
            aria-selected={on}
            onPress={() => onChange(o.value)}
            style={[
              { flex: 1, minHeight: 42, borderRadius: 9, alignItems: "center", justifyContent: "center" },
              on && { backgroundColor: c.card, boxShadow: `0 1px 3px ${c.sh}` },
            ]}
          >
            <Text style={{ fontFamily: font.head, fontSize: 13, color: on ? c.ink : c.mut }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Sticky({ children, size = 15, style }: { children: ReactNode; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: fixed.sticky, borderRadius: 12, padding: 16 }, style]}>
      <Text style={{ fontFamily: font.bodyMedium, fontSize: size, lineHeight: Math.round(size * 1.55), color: fixed.stickyInk }}>
        {children}
      </Text>
    </View>
  );
}

export function Avatar({
  label,
  icon,
  size = 44,
  fontSize = 16,
  bg = fixed.avatar,
  fg = fixed.avatarInk,
  style,
}: {
  label?: string;
  icon?: IconName;
  size?: number;
  fontSize?: number;
  bg?: string;
  fg?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} color={fg} />
      ) : (
        <Text style={{ fontFamily: font.head, fontSize, color: fg }}>{label}</Text>
      )}
    </View>
  );
}

export function RoundBtn({
  icon,
  label,
  onPress,
  color,
  fill,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  fill?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [
        { width: 48, height: 48, borderRadius: 24, backgroundColor: c.card, alignItems: "center", justifyContent: "center" },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Icon name={icon} fill={fill} color={color ?? c.ink} />
    </Pressable>
  );
}

export function Check({ on }: { on: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: on ? c.daun : c.ov,
        backgroundColor: on ? c.daun : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {on ? <Icon name="check" size={18} color={c.onp} /> : null}
    </View>
  );
}

export function Inp({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={c.mut}
      {...rest}
      onFocus={e => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={e => {
        setFocus(false);
        onBlur?.(e);
      }}
      style={[
        {
          width: "100%",
          backgroundColor: c.card,
          borderRadius: 8,
          minHeight: 46,
          paddingHorizontal: 14,
          fontFamily: font.body,
          fontSize: 15,
          color: c.ink,
          boxShadow: focus ? `0 0 0 2px ${c.chili}` : `0 1px 2px ${c.sh}`,
        },
        Platform.OS === "web" && ({ outlineWidth: 0 } as TextStyle),
        style,
      ]}
    />
  );
}

// The design's clamp(46px, 9vw, 84px), shrunk to fit `avail` px on narrow phones.
export function usePxlSize(text: string, avail: number, max?: number) {
  const { w } = useLayout();
  const design = max ?? clamp(46, 0.09 * w, 84);
  if (!avail) return design;
  return Math.min(design, Math.floor(avail / amountEm(text)));
}

export function Pxl({
  children,
  size,
  color,
  style,
}: {
  children: string;
  size: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  const { c } = useTheme();
  return (
    <Text
      numberOfLines={1}
      style={[
        {
          fontFamily: font.head,
          fontSize: size,
          lineHeight: Math.round(size * 1.1),
          letterSpacing: -0.04 * size,
          color: color ?? c.pxl,
          fontVariant: ["tabular-nums"],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// Children get the panel's colors through ThemeScope.
export function Hero({ lt, style, children }: { lt?: boolean; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const { w } = useLayout();
  const pad = clamp(20, w * 0.04, 36);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const id = svgId(useId());

  if (lt) {
    return (
      <ThemeScope palette={heroLt} flavor="heroLt">
        <View style={[{ backgroundColor: heroLt.sirup, borderRadius: 16, padding: pad }, style]}>{children}</View>
      </ThemeScope>
    );
  }

  // linear-gradient(150deg, ...) and radial-gradient(circle at 92% 0, ... 45%)
  const W = size.w;
  const H = size.h;
  const dx = 0.5;
  const dy = 0.866;
  const L = W * dx + H * dy;
  return (
    <ThemeScope palette={hero} flavor="hero">
      <View
        onLayout={e => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        style={[
          {
            backgroundColor: "#006b4b",
            borderRadius: 16,
            padding: pad,
            boxShadow: "0 20px 40px -22px rgba(0,105,72,0.7)",
          },
          style,
        ]}
      >
        {W > 0 ? (
          <Svg aria-hidden style={StyleSheet.absoluteFill} width={W} height={H}>
            <Defs>
              <LinearGradient
                id={`l${id}`}
                gradientUnits="userSpaceOnUse"
                x1={W / 2 - (dx * L) / 2}
                y1={H / 2 - (dy * L) / 2}
                x2={W / 2 + (dx * L) / 2}
                y2={H / 2 + (dy * L) / 2}
              >
                <Stop offset="0" stopColor="#005137" />
                <Stop offset="1" stopColor="#00855d" />
              </LinearGradient>
              <RadialGradient
                id={`r${id}`}
                gradientUnits="userSpaceOnUse"
                cx={0.92 * W}
                cy={0}
                fx={0.92 * W}
                fy={0}
                r={0.45 * Math.hypot(0.92 * W, H)}
              >
                <Stop offset="0" stopColor="#ffb95f" stopOpacity={0.35} />
                <Stop offset="1" stopColor="#ffb95f" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={W} height={H} rx={16} fill={`url(#l${id})`} />
            <Rect width={W} height={H} rx={16} fill={`url(#r${id})`} />
          </Svg>
        ) : null}
        {children}
      </View>
    </ThemeScope>
  );
}

export function Screen({
  children,
  focus,
  bottom,
  contentStyle,
}: {
  children: ReactNode;
  // Full-screen steps with no header or tab bar.
  focus?: boolean;
  bottom?: number;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const { wide } = useLayout();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.paper }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: wide ? 48 : 16,
        paddingTop: (wide ? 36 : 16) + (focus ? insets.top : 0),
        paddingBottom: focus ? 48 + insets.bottom : bottom ?? (wide ? 80 : 40),
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={[{ width: "100%", maxWidth: 1024, alignSelf: "center" }, contentStyle]}>{children}</View>
    </ScrollView>
  );
}

// Two columns from 900px, stacked below. `r` gives the left column more room.
export function Two({
  r,
  children,
  style,
}: {
  r?: boolean;
  children: [ReactNode, ReactNode];
  style?: StyleProp<ViewStyle>;
}) {
  const { wide } = useLayout();
  const [a, b] = children;
  if (!wide) {
    return (
      <View style={[{ gap: 28 }, style]}>
        {a}
        {b}
      </View>
    );
  }
  return (
    <View style={[{ flexDirection: "row", gap: 44 }, style]}>
      <View style={{ flex: r ? 1.6 : 1.1, minWidth: 0 }}>{a}</View>
      <View style={{ flex: 1, minWidth: 0 }}>{b}</View>
    </View>
  );
}

// repeat(auto-fill, minmax(min, 1fr)), but one column never overflows a narrow screen.
export function Grid({ min = 310, gap = 16, children }: { min?: number; gap?: number; children: ReactNode }) {
  const [w, setW] = useState(0);
  const cols = w ? Math.max(1, Math.floor((w + gap) / (min + gap))) : 1;
  const itemW: DimensionValue = cols === 1 ? "100%" : Math.floor(((w - gap * (cols - 1)) / cols) * 100) / 100;
  return (
    <View
      onLayout={e => setW(e.nativeEvent.layout.width)}
      style={{ flexDirection: "row", flexWrap: "wrap", gap }}
    >
      {React.Children.toArray(children).map((child, i) => (
        <View key={(child as { key?: React.Key }).key ?? i} style={{ width: itemW }}>
          {child}
        </View>
      ))}
    </View>
  );
}

export function HScroll({
  children,
  gap = 12,
  snap,
  style,
  contentStyle,
}: {
  children: ReactNode;
  gap?: number;
  snap?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[{ gap, paddingTop: 4, paddingHorizontal: 2, paddingBottom: 12 }, contentStyle]}
      snapToInterval={snap}
      decelerationRate={snap ? "fast" : undefined}
    >
      {children}
    </ScrollView>
  );
}
