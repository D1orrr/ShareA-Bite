import React, { ReactNode } from "react";
import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text accessibilityRole="header" className="text-lg font-bold text-ink">
          {title}
        </Text>
        {subtitle ? <Text className="mt-0.5 text-sm text-muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
