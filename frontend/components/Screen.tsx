import React, { ReactNode, RefObject } from "react";
import { ScrollView, View } from "react-native";

// Phones use the full width; tablets and desktop browsers get a centered
// reading column instead of stretched cards.
export const CONTENT_MAX_WIDTH = 680;

interface ScreenProps {
  children: ReactNode;
  // Space kept free under the content, e.g. for a fixed bottom bar.
  bottomInset?: number;
  // Rendered above the scroll area: toasts, fixed bars, dialogs.
  overlay?: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
}

export function Screen({ children, bottomInset = 32, overlay, scrollRef }: ScreenProps) {
  return (
    <View className="flex-1 bg-cream">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomInset,
          width: "100%",
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: "center",
        }}
      >
        {children}
      </ScrollView>
      {overlay}
    </View>
  );
}
