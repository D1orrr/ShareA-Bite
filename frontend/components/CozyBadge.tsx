import React from "react";
import { View, Text } from "react-native";

interface CozyBadgeProps {
  label: string;
  variant?: "terracotta" | "mustard" | "sky" | "green" | "red" | "neutral";
  className?: string;
  icon?: React.ReactNode;
}

export const CozyBadge: React.FC<CozyBadgeProps> = ({
  label,
  variant = "terracotta",
  className = "",
  icon,
}) => {
  const styles = {
    terracotta: { bg: "#FDEEE9", text: "#C8573E" },
    mustard: { bg: "#FEF3C7", text: "#B45309" },
    sky: { bg: "#E0F2FE", text: "#0369A1" },
    green: { bg: "#DCFCE7", text: "#15803D" },
    red: { bg: "#FEE2E2", text: "#B91C1C" },
    neutral: { bg: "#F5EFEB", text: "#786F6A" },
  };

  const current = styles[variant];

  return (
    <View
      className={`px-3 py-1 rounded-full flex-row items-center self-start ${className}`}
      style={{ backgroundColor: current.bg }}
    >
      {icon ? <View className="mr-1">{icon}</View> : null}
      <Text
        style={{ color: current.text }}
        className="font-bold text-xs tracking-tight"
      >
        {label}
      </Text>
    </View>
  );
};
