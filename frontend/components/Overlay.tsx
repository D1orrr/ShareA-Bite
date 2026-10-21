import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font } from "../constants/theme";
import { nativeDriver, useTheme } from "./theme";

type OverlayValue = {
  toast: (message: string) => void;
  openSheet: (node: ReactNode) => void;
  closeSheet: () => void;
};

const OverlayContext = createContext<OverlayValue>({
  toast: () => {},
  openSheet: () => {},
  closeSheet: () => {},
});

export const useToast = () => useContext(OverlayContext).toast;
export const useSheet = () => useContext(OverlayContext);

// Above every screen, so a toast still shows while the sheet is open.
export function OverlayProvider({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [shown, setShown] = useState(false);
  const [sheet, setSheet] = useState<ReactNode>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const anim = useRef(new Animated.Value(0)).current;

  const toast = useCallback((m: string) => {
    setMessage(m);
    setShown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(false), 1900);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    Animated.timing(anim, { toValue: shown ? 1 : 0, duration: 300, useNativeDriver: nativeDriver }).start();
  }, [shown, anim]);

  const value = useMemo(
    () => ({ toast, openSheet: setSheet, closeSheet: () => setSheet(null) }),
    [toast]
  );

  return (
    <OverlayContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {sheet}
        <Animated.View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 92 + insets.bottom,
            alignItems: "center",
            pointerEvents: "none",
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          }}
        >
          <View
            role="status"
            aria-live="polite"
            accessibilityLiveRegion="polite"
            style={{ backgroundColor: c.ink, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 99 }}
          >
            <Text style={{ color: c.paper, fontFamily: font.headSemi, fontSize: 14, textAlign: "center" }}>
              {message}
            </Text>
          </View>
        </Animated.View>
      </View>
    </OverlayContext.Provider>
  );
}
