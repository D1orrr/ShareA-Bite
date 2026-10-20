import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fixed, font, rp } from "../constants/theme";
import { Icon } from "./Icon";
import { useToast } from "./Overlay";
import { nativeDriver, useLayout, useTheme } from "./theme";
import { Txt } from "./Txt";
import { between, Btn, Card, Inp, Pill, row } from "./ui";

type Mode = "Resep" | "Tips" | "Tempat";

// Only iOS needs this (Android resizes the window); on the web it would block the backdrop.
const SheetFrame = Platform.OS === "ios" ? KeyboardAvoidingView : View;

// RN Web only applies box-none from StyleSheet.create, not from inline styles.
const styles = StyleSheet.create({ passThrough: { pointerEvents: "box-none" } });

export function ShareSheet({ onClose }: { onClose: () => void }) {
  const { c } = useTheme();
  const { wide } = useLayout();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("Resep");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 300, useNativeDriver: nativeDriver }).start();
  }, [enter]);

  // Android back button and Escape on the web close the sheet.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (Platform.OS === "web") window.addEventListener("keydown", onKey);
    return () => {
      sub.remove();
      if (Platform.OS === "web") window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const post = () => {
    if (!title.trim()) {
      setError("Judulnya jangan kosong ya.");
      return;
    }
    onClose();
    toast("Postingan terkirim!");
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 80 }]}>
      <Pressable
        accessible={false}
        focusable={false}
        onPress={onClose}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: fixed.backdrop },
          Platform.OS === "web" && ({ backdropFilter: "blur(4px)" } as ViewStyle),
        ]}
      />
      <SheetFrame
        behavior="padding"
        style={[styles.passThrough, { flex: 1, justifyContent: wide ? "center" : "flex-end", alignItems: "center" }]}
      >
        <Animated.View
          role="dialog"
          aria-modal
          aria-label="Bagikan ke Komunitas"
          style={{
            backgroundColor: c.paper,
            width: "100%",
            maxWidth: 540,
            maxHeight: "92%",
            borderRadius: 24,
            borderBottomLeftRadius: wide ? 24 : 0,
            borderBottomRightRadius: wide ? 24 : 0,
            overflow: "hidden",
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, paddingBottom: 20 + (wide ? 0 : insets.bottom), gap: 12 }}
          >
            <View style={[row, between]}>
              <Txt v="h2">Bagikan ke Komunitas</Txt>
              <Pressable
                role="button"
                aria-label="Tutup"
                onPress={onClose}
                style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="close" color={c.ink} />
              </Pressable>
            </View>
            <Pill<Mode>
              maxWidth="100%"
              options={[
                { value: "Resep", label: "Resep" },
                { value: "Tips", label: "Tips" },
                { value: "Tempat", label: "Tempat" },
              ]}
              value={mode}
              onChange={m => {
                setMode(m);
                toast(`Mode ${m} dipilih`);
              }}
            />
            <Card
              style={{
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: c.mut,
                alignItems: "center",
              }}
            >
              <Txt color={c.mut}>Tambah foto masakan</Txt>
            </Card>
            <Inp
              placeholder="Judul resep"
              aria-label="Judul resep"
              value={title}
              onChangeText={t => {
                setTitle(t);
                if (error) setError("");
              }}
            />
            <View style={row}>
              <Inp placeholder="Waktu (mnt)" aria-label="Waktu (mnt)" keyboardType="number-pad" style={{ flex: 1, width: undefined }} />
              <Inp placeholder="Porsi" aria-label="Porsi" keyboardType="number-pad" style={{ flex: 1, width: undefined }} />
            </View>
            <View style={row}>
              <Inp placeholder="Bahan" aria-label="Bahan" style={{ flex: 1, width: undefined }} />
              <Inp
                placeholder="Harga"
                aria-label="Harga"
                inputMode="numeric"
                value={price}
                onChangeText={setPrice}
                style={{ flex: 1, width: undefined, fontFamily: font.headMedium, fontVariant: ["tabular-nums"] }}
              />
            </View>
            <View style={[row, between]}>
              <Txt v="cap">Total otomatis</Txt>
              <View style={{ backgroundColor: c.chili, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 12 }}>
                <Text style={{ fontFamily: font.head, fontSize: 14, color: c.onp }}>
                  {rp(Number(price.replace(/\D/g, "")) || 0)}
                </Text>
              </View>
            </View>
            {error ? (
              <Txt b color={c.danger} role="alert">
                {error}
              </Txt>
            ) : null}
            <View style={row}>
              <Btn ghost grow title="Simpan draft" onPress={() => toast("Draft tersimpan")} />
              <Btn grow title="Post" onPress={post} />
            </View>
          </ScrollView>
        </Animated.View>
      </SheetFrame>
    </View>
  );
}
