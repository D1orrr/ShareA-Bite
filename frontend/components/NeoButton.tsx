import React from "react";
import { TouchableOpacity, Text, ViewStyle, StyleProp } from "react-native";

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  bg?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  title,
  onPress,
  bg = "#99F6E4", // Mint pastel default
  textColor = "#000000",
  size = "md",
  disabled = false,
  className = "",
  style,
  icon,
}) => {
  const sizeClasses = {
    sm: "py-2 px-3 text-xs",
    md: "py-3 px-4 text-sm",
    lg: "py-4 px-6 text-base",
  };

  const borderSize = size === "sm" ? 3 : 4;
  const shadowDepth = size === "sm" ? 3 : 4;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      className={`rounded-xl flex-row items-center justify-center ${disabled ? "opacity-50" : ""} ${className}`}
      style={[
        {
          backgroundColor: bg,
          borderColor: "#000000",
          borderWidth: borderSize,
          boxShadow: disabled ? "none" : `${shadowDepth}px ${shadowDepth}px 0px 0px #000000`,
        },
        style,
      ]}
    >
      {icon ? <>{icon}</> : null}
      <Text
        style={{ color: textColor }}
        className={`font-black uppercase tracking-wider ${sizeClasses[size]}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
