import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import type { IconName } from "./Button";

interface ChipProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
  // Shown after the label, e.g. "close" for removable or "checkmark" for picked,
  // so the state is not carried by color alone.
  trailingIcon?: IconName;
  // "checkbox" for multi-select toggles, "radio" for one-of-many choices; both
  // expose `selected` as aria-checked. Without a role the chip is a plain action.
  role?: "checkbox" | "radio";
  accessibilityLabel?: string;
}

export function Chip({
  label,
  onPress,
  selected = false,
  trailingIcon,
  role,
  accessibilityLabel,
}: ChipProps) {
  return (
    <TouchableOpacity
      role={role ?? "button"}
      aria-checked={role ? selected : undefined}
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.75}
      onPress={onPress}
      className={`min-h-[44px] flex-row items-center rounded-full border px-4 ${
        selected ? "border-ink bg-ink" : "border-field bg-surface"
      }`}
    >
      <Text className={`text-sm font-medium ${selected ? "text-white" : "text-ink"}`}>{label}</Text>
      {trailingIcon ? (
        <Ionicons
          name={trailingIcon}
          size={16}
          color={selected ? colors.surface : colors.ink}
          style={{ marginLeft: 6 }}
        />
      ) : null}
    </TouchableOpacity>
  );
}
