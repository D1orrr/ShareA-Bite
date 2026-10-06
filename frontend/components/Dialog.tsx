import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WIDE_SCREEN = 640;

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  // "sheet" docks to the bottom on phones, within thumb reach, and centers on
  // wide screens. "center" always centers.
  placement?: "sheet" | "center";
}

// Closes on backdrop tap, Android back, and Escape on the web (via onRequestClose).
export function Dialog({ visible, onClose, children, placement = "center" }: DialogProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const docked = placement === "sheet" && width < WIDE_SCREEN;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View className={`flex-1 bg-black/40 ${docked ? "justify-end" : "items-center justify-center p-6"}`}>
          <Pressable
            accessible={false}
            tabIndex={-1}
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
          <View
            className={`w-full bg-surface p-5 ${docked ? "rounded-t-3xl" : "max-w-[440px] rounded-2xl"}`}
            style={{
              paddingBottom: docked ? 20 + insets.bottom : 20,
              boxShadow: "0px 12px 32px rgba(42,34,29,0.25)",
            }}
          >
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
