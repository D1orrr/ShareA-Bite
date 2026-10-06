import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Variant = "primary" | "secondary";

interface ButtonProps {
  title: string;
  onPress: () => void;
  // Each screen has at most one primary (accent) action.
  variant?: Variant;
  size?: "md" | "lg";
  icon?: IconName;
  disabled?: boolean;
  className?: string;
  accessibilityLabel?: string;
}

const containerClasses: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "border border-field bg-surface",
};

const labelClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-ink",
};

const iconColors: Record<Variant, string> = {
  primary: colors.surface,
  secondary: colors.ink,
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  className = "",
  accessibilityLabel,
}: ButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center justify-center rounded-xl px-3 py-2.5 ${
        size === "lg" ? "min-h-[52px]" : "min-h-[44px]"
      } ${containerClasses[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={iconColors[variant]} style={{ marginRight: 6 }} />
      ) : null}
      <Text
        className={`shrink text-center font-semibold ${size === "lg" ? "text-base" : "text-sm"} ${
          labelClasses[variant]
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
