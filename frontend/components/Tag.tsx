import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import type { IconName } from "./Button";

type Tone = "neutral" | "leaf" | "accent";

interface TagProps {
  label: string;
  tone?: Tone;
  icon?: IconName;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-track",
  leaf: "bg-leaf-soft",
  accent: "bg-accent-soft",
};

const textClasses: Record<Tone, string> = {
  neutral: "text-ink",
  leaf: "text-leaf",
  accent: "text-accent-deep",
};

const iconColors: Record<Tone, string> = {
  neutral: colors.ink,
  leaf: colors.leaf,
  accent: colors.accentDeep,
};

// Non-interactive label. Square-ish corners keep it distinct from tappable chips.
export function Tag({ label, tone = "neutral", icon, className = "" }: TagProps) {
  return (
    <View className={`flex-row items-center rounded-md px-2 py-1 ${toneClasses[tone]} ${className}`}>
      {icon ? (
        <Ionicons name={icon} size={13} color={iconColors[tone]} style={{ marginRight: 4 }} />
      ) : null}
      <Text className={`text-xs font-semibold ${textClasses[tone]}`}>{label}</Text>
    </View>
  );
}
