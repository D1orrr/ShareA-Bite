import React, { useEffect, useState } from "react";
import { Image, ImageStyle, StyleProp, Text, View } from "react-native";

interface RecipeImageProps {
  uri: string;
  // Shown when the photo cannot load (offline, broken link).
  fallbackEmoji: string;
  style: StyleProp<ImageStyle>;
  emojiSize?: number;
}

export function RecipeImage({ uri, fallbackEmoji, style, emojiSize = 40 }: RecipeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  if (failed || !uri) {
    return (
      <View className="items-center justify-center bg-track" style={style}>
        <Text style={{ fontSize: emojiSize }}>{fallbackEmoji}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
      accessibilityIgnoresInvertColors
    />
  );
}
