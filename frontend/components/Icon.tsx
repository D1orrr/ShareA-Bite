import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { font } from "../constants/theme";
import { useTheme } from "./theme";

// Codepoints in the bundled Material Symbols subset; the filled font has the same icons.
const glyphs = {
  account_circle: 0xe853,
  add: 0xe145,
  arrow_back: 0xe5c4,
  auto_awesome: 0xe65f,
  bookmark: 0xe866,
  chat_bubble: 0xe0ca,
  check: 0xe5ca,
  close: 0xe5cd,
  explore: 0xe87a,
  favorite: 0xe87d,
  forum: 0xe0bf,
  local_fire_department: 0xef55,
  location_on: 0xe0c8,
  notifications: 0xe7f4,
  paid: 0xf041,
  payments: 0xef63,
  pin_drop: 0xe55e,
  schedule: 0xe8b5,
  search: 0xe8b6,
  share: 0xe80d,
  shopping_bag: 0xf1cc,
  shopping_basket: 0xe8cb,
  workspace_premium: 0xe7af,
} as const;

export type IconName = keyof typeof glyphs;

export function Icon({
  name,
  size = 22,
  color,
  fill = false,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  fill?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const { c } = useTheme();
  return (
    <Text
      aria-hidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      selectable={false}
      style={[
        {
          fontFamily: fill ? font.iconFill : font.icon,
          fontSize: size,
          lineHeight: size,
          width: size,
          height: size,
          textAlign: "center",
          color: color ?? c.ink,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {String.fromCharCode(glyphs[name])}
    </Text>
  );
}
