import React, { ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  // Image cards set padded={false} so the photo runs edge to edge.
  padded?: boolean;
  className?: string;
}

export function Card({ children, padded = true, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-line bg-surface ${
        padded ? "p-4" : "overflow-hidden"
      } ${className}`}
    >
      {children}
    </View>
  );
}
