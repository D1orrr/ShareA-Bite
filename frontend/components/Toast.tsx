import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ToastTone = "success" | "error";

export interface ToastState {
  message: string;
  tone: ToastTone;
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, tone: ToastTone = "success") => {
      // Restart the timer so a second toast is not cut short by the first one's timeout.
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, tone });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return { toast, show };
}

// Floats over the content (hence the shadow) so it is visible wherever the
// user has scrolled, instead of appearing at the top of a long page.
export function Toast({ toast, bottom = 16 }: { toast: ToastState | null; bottom?: number }) {
  if (!toast) return null;
  const isError = toast.tone === "error";

  return (
    <View
      style={{ position: "absolute", left: 16, right: 16, bottom, alignItems: "center", pointerEvents: "box-none" }}
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className="w-full flex-row items-center rounded-xl bg-ink px-4 py-3"
        style={{ maxWidth: 520, boxShadow: "0px 6px 20px rgba(42,34,29,0.25)" }}
      >
        <Ionicons
          name={isError ? "alert-circle" : "checkmark-circle"}
          size={20}
          color={isError ? "#FCA5A5" : "#86EFAC"}
        />
        <Text className="ml-2.5 flex-1 text-sm font-medium text-white">{toast.message}</Text>
      </View>
    </View>
  );
}
