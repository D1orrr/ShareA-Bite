import React from "react";
import { View, Text } from "react-native";

interface NeoBadgeProps {
  label: string;
  bg?: string;
  textColor?: string;
  className?: string;
}

export const NeoBadge: React.FC<NeoBadgeProps> = ({
  label,
  bg = "#FEF08A",
  textColor = "#000000",
  className = "",
}) => {
  return (
    <View
      className={`px-2.5 py-1 rounded-md border-2 border-black ${className}`}
      style={{ backgroundColor: bg }}
    >
      <Text style={{ color: textColor }} className="font-extrabold text-xs">
        {label}
      </Text>
    </View>
  );
};
