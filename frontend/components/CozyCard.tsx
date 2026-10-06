import React, { ReactNode } from "react";
import { View, ViewStyle, StyleProp, Platform } from "react-native";

interface CozyCardProps {
  children: ReactNode;
  bg?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  floating?: boolean;
}

export const CozyCard: React.FC<CozyCardProps> = ({
  children,
  bg = "#FFFFFF",
  className = "",
  style,
  floating = false,
}) => {
  const shadowStyle: ViewStyle = Platform.select({
    web: {
      boxShadow: floating
        ? "0 14px 34px -4px rgba(45, 37, 34, 0.10), 0 4px 12px -2px rgba(45, 37, 34, 0.04)"
        : "0 6px 22px -3px rgba(45, 37, 34, 0.07), 0 2px 8px -2px rgba(45, 37, 34, 0.03)",
    } as any,
    default: {
      shadowColor: "#2D2522",
      shadowOffset: { width: 0, height: floating ? 10 : 5 },
      shadowOpacity: floating ? 0.12 : 0.07,
      shadowRadius: floating ? 18 : 12,
      elevation: floating ? 6 : 3,
    },
  });

  return (
    <View
      className={`rounded-3xl p-5 overflow-hidden ${className}`}
      style={[
        {
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: "rgba(239, 232, 225, 0.8)", // Soft, delicate warm border
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
};
