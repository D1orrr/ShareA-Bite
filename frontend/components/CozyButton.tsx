import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  StyleProp,
  Platform,
  View,
} from "react-native";

interface CozyButtonProps {
  title: string;
  onPress: () => void;
  bg?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "sky" | "ghost";
}

export const CozyButton: React.FC<CozyButtonProps> = ({
  title,
  onPress,
  bg,
  textColor,
  size = "md",
  disabled = false,
  className = "",
  style,
  icon,
  variant = "primary",
}) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  // Variant presets based on Warm & Cozy Palette
  const variantConfig = {
    primary: {
      backgroundColor: bg || "#E06D53", // Warm Orange / Terracotta
      color: textColor || "#FFFFFF",
      shadowColor: "#E06D53",
      shadowOpacity: 0.3,
    },
    secondary: {
      backgroundColor: bg || "#F59E0B", // Mustard Yellow
      color: textColor || "#FFFFFF",
      shadowColor: "#F59E0B",
      shadowOpacity: 0.25,
    },
    sky: {
      backgroundColor: bg || "#38BDF8", // Soft Sky Blue
      color: textColor || "#FFFFFF",
      shadowColor: "#38BDF8",
      shadowOpacity: 0.25,
    },
    ghost: {
      backgroundColor: bg || "#F5EFEB", // Warm Surface
      color: textColor || "#2D2522",
      shadowColor: "#2D2522",
      shadowOpacity: 0.05,
    },
  };

  const selected = variantConfig[variant];

  const sizeStyles = {
    sm: "py-2 px-4 text-xs",
    md: "py-3.5 px-6 text-sm",
    lg: "py-4 px-8 text-base",
  };

  const shadowStyle: ViewStyle = Platform.select({
    web: {
      boxShadow: disabled
        ? "none"
        : isPressed
        ? "0 2px 8px rgba(45, 37, 34, 0.08)"
        : `0 8px 20px -3px ${selected.backgroundColor}55, 0 3px 6px -1px rgba(45, 37, 34, 0.05)`,
      transition: "all 0.15s ease",
      transform: isPressed ? "scale(0.97)" : "scale(1)",
    } as any,
    default: {
      shadowColor: selected.shadowColor,
      shadowOffset: { width: 0, height: isPressed ? 2 : 5 },
      shadowOpacity: disabled ? 0 : isPressed ? 0.15 : selected.shadowOpacity,
      shadowRadius: isPressed ? 4 : 10,
      elevation: disabled ? 0 : isPressed ? 2 : 4,
      transform: [{ scale: isPressed ? 0.98 : 1 }],
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={`rounded-full flex-row items-center justify-center ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={[
        {
          backgroundColor: selected.backgroundColor,
        },
        shadowStyle,
        style,
      ]}
    >
      {icon ? <View className="mr-2">{icon}</View> : null}
      <Text
        style={{ color: selected.color }}
        className={`font-extrabold tracking-wide ${sizeStyles[size]}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
