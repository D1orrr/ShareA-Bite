import React, { useEffect } from "react";
import { BackHandler, Platform, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fixed } from "../constants/theme";
import { useStore } from "../context/AppStore";
import { Icon } from "./Icon";
import { useSheet } from "./Overlay";
import { useLayout, useTheme } from "./theme";
import { Txt } from "./Txt";
import { between, Btn, row } from "./ui";

const styles = StyleSheet.create({ passThrough: { pointerEvents: "box-none" } });

/** "Kuota habis" dialog with a shortcut to the plans screen. */
function LimitSheet({ message, onClose }: { message: string; onClose: () => void }) {
  const { c } = useTheme();
  const { wide } = useLayout();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (Platform.OS === "web") window.addEventListener("keydown", onKey);
    return () => {
      sub.remove();
      if (Platform.OS === "web") window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 90 }]}>
      <Pressable
        accessible={false}
        focusable={false}
        onPress={onClose}
        style={[StyleSheet.absoluteFill, { backgroundColor: fixed.backdrop }, Platform.OS === "web" && ({ backdropFilter: "blur(4px)" } as ViewStyle)]}
      />
      <View style={[styles.passThrough, { flex: 1, justifyContent: wide ? "center" : "flex-end", alignItems: "center" }]}>
        <View
          role="dialog"
          aria-modal
          aria-label="Kuota paket habis"
          style={{
            backgroundColor: c.paper,
            width: "100%",
            maxWidth: 480,
            borderRadius: 24,
            borderBottomLeftRadius: wide ? 24 : 0,
            borderBottomRightRadius: wide ? 24 : 0,
            padding: 22,
            paddingBottom: 22 + (wide ? 0 : insets.bottom),
            gap: 14,
          }}
        >
          <View style={[row, between]}>
            <View style={[row, { flexShrink: 1 }]}>
              <Icon name="workspace_premium" color={c.kunyit} size={30} fill />
              <Txt v="h2">Kuota habis</Txt>
            </View>
            <Pressable role="button" aria-label="Tutup" onPress={onClose} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
              <Icon name="close" color={c.ink} />
            </Pressable>
          </View>
          <Txt>{message}</Txt>
          <Btn
            icon="workspace_premium"
            title="Lihat paket"
            onPress={() => {
              onClose();
              router.push("/paket");
            }}
          />
          <Btn ghost title="Nanti saja" onPress={onClose} />
        </View>
      </View>
    </View>
  );
}

/** Opens the limit sheet whenever the store reports a plan limit. Render once, inside the overlay. */
export function LimitWatcher() {
  const { limitHit, clearLimit } = useStore();
  const { openSheet, closeSheet } = useSheet();
  useEffect(() => {
    if (!limitHit) return;
    const close = () => {
      closeSheet();
      clearLimit();
    };
    openSheet(<LimitSheet message={limitHit.message} onClose={close} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitHit]);
  return null;
}
