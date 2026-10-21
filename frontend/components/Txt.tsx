import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { clamp, font } from "../constants/theme";
import { useLayout, useTheme } from "./theme";

export type Variant = "body" | "cap" | "d" | "h1" | "h2" | "h3";

type Props = TextProps & {
  v?: Variant;
  // Bold, like <b> in the design.
  b?: boolean;
  // Plus Jakarta Sans with tabular numbers, like the .m class.
  m?: boolean;
  color?: string;
};

export function useType() {
  const { w } = useLayout();
  const vw = w / 100;
  const head = (size: number, lh = 1.2): TextStyle => ({
    fontFamily: font.head,
    fontSize: size,
    lineHeight: Math.round(size * lh),
    letterSpacing: -0.02 * size,
  });
  return {
    d: head(clamp(36, 6 * vw, 56), 1.12),
    h1: head(clamp(26, 3.4 * vw, 36)),
    h2: head(22),
    h3: { fontFamily: font.headSemi, fontSize: 17, lineHeight: 20, letterSpacing: -0.34 } as TextStyle,
    body: { fontFamily: font.body, fontSize: 15, lineHeight: 23 } as TextStyle,
    cap: { fontFamily: font.body, fontSize: 13, lineHeight: 20 } as TextStyle,
    head,
  };
}

export function Txt({ v = "body", b, m, color, style, ...rest }: Props) {
  const { c } = useTheme();
  const t = useType();
  const base = t[v];
  const family =
    v === "body" || v === "cap"
      ? m
        ? b
          ? font.head
          : font.headMedium
        : b
          ? font.bodyBold
          : font.body
      : base.fontFamily;
  return (
    <Text
      role={v === "d" || v === "h1" || v === "h2" ? "heading" : undefined}
      {...rest}
      style={[
        base,
        { fontFamily: family, color: color ?? (v === "cap" ? c.mut : c.ink) },
        m && { fontVariant: ["tabular-nums"] },
        style,
      ]}
    />
  );
}

// Inline bold inside a Txt. Keeps the parent's size and color.
export function B({ m, style, ...rest }: TextProps & { m?: boolean }) {
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: m ? font.head : font.bodyBold },
        m && { fontVariant: ["tabular-nums"] },
        style,
      ]}
    />
  );
}
