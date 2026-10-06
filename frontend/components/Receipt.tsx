import React from "react";
import { Text, View } from "react-native";
import colors from "../constants/colors";
import { tabularNums } from "../constants/format";

// Price lists are drawn like a warung receipt (nota): label left, amount right,
// dashed rule before the totals. It is the app's recurring money motif.

type Tone = "ink" | "muted" | "leaf";

const toneClasses: Record<Tone, string> = {
  ink: "text-ink",
  muted: "text-muted",
  leaf: "text-leaf",
};

interface PriceRowProps {
  label: string;
  value: string;
  tone?: Tone;
  strong?: boolean;
}

export function PriceRow({ label, value, tone = "ink", strong = false }: PriceRowProps) {
  const weight = strong ? "font-bold" : "font-normal";
  return (
    <View className="flex-row items-start justify-between gap-3 py-1">
      <Text className={`flex-1 text-sm ${toneClasses[tone]} ${weight}`}>{label}</Text>
      <Text className={`text-sm ${toneClasses[tone]} ${strong ? "font-bold" : "font-medium"}`} style={tabularNums}>
        {value}
      </Text>
    </View>
  );
}

// Android cannot dash a single border side, so a dashed box is clipped to its top edge.
export function DashedLine({ className = "" }: { className?: string }) {
  return (
    <View className={`h-px overflow-hidden ${className}`}>
      <View style={{ height: 2, borderWidth: 1, borderColor: colors.field, borderStyle: "dashed" }} />
    </View>
  );
}
