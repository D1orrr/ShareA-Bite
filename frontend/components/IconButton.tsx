import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import type { IconName } from "./Button";

interface IconButtonProps {
  icon: IconName;
  // Screen reader label; the icon alone carries no text.
  label: string;
  onPress: () => void;
  color?: string;
}

// 44x44 touch area even though the glyph is 20px.
export function IconButton({ icon, label, onPress, color = colors.muted }: IconButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.6}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full"
    >
      <Ionicons name={icon} size={20} color={color} />
    </TouchableOpacity>
  );
}
