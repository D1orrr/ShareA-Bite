import React, { ReactNode } from "react";
import { View, ViewStyle, StyleProp } from "react-native";

interface NeoCardProps {
  children: ReactNode;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  shadowOffset?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  bg = "#FFFFFF",
  borderColor = "#000000",
  borderWidth = 4,
  shadowOffset = 4,
  className = "",
  style,
}) => {
  return (
    <View
      className={`rounded-2xl p-4 overflow-hidden ${className}`}
      style={[
        {
          backgroundColor: bg,
          borderColor: borderColor,
          borderWidth: borderWidth,
          boxShadow: `${shadowOffset}px ${shadowOffset}px 0px 0px #000000`,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
