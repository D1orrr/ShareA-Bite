import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedProps<T>) {
  return (
    <View role="radiogroup" className={`flex-row gap-1 rounded-xl bg-track p-1 ${className}`}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            role="radio"
            aria-checked={selected}
            activeOpacity={0.8}
            onPress={() => onChange(option.value)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-lg px-1 ${
              selected ? "bg-ink" : ""
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${selected ? "text-white" : "text-muted"}`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
