import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
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
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PostType } from "../constants/data";
import { useStore } from "../context/AppStore";
import { fixed, font, rp } from "../constants/theme";
import { Icon } from "./Icon";
import { useToast } from "./Overlay";
import { nativeDriver, useLayout, useTheme } from "./theme";
import { Txt } from "./Txt";
import { between, Btn, Inp, Pill, row } from "./ui";

type Mode = "Resep" | "Tips" | "Tempat";
const TYPE_OF: Record<Mode, PostType> = { Resep: "Resep", Tips: "Trik Masak", Tempat: "Info Warung" };
const DRAFT_KEY = "sab_post_draft";

// Only iOS needs this (Android resizes the window); on the web it would block the backdrop.
const SheetFrame = Platform.OS === "ios" ? KeyboardAvoidingView : View;

// RN Web only applies box-none from StyleSheet.create, not from inline styles.
const styles = StyleSheet.create({ passThrough: { pointerEvents: "box-none" } });

export function ShareSheet({ onClose }: { onClose: () => void }) {
  const { c } = useTheme();
  const { wide } = useLayout();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { addPost } = useStore();
  const [mode, setMode] = useState<Mode>("Resep");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [portions, setPortions] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | undefined>(); // data URL, uploaded with the post
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const digits = (s: string) => Number(s.replace(/\D/g, "")) || 0;

  // Restore a saved draft
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY)
      .then(raw => {
        if (!raw) return;
        const d = JSON.parse(raw);
        setMode(d.mode ?? "Resep");
        setTitle(d.title ?? "");
        setMinutes(d.minutes ?? "");
        setPortions(d.portions ?? "");
        setDetails(d.details ?? "");
        setPrice(d.price ?? "");
      })
      .catch(() => {});
  }, []);

  const saveDraft = async () => {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ mode, title, minutes, portions, details, price })).catch(() => {});
    toast("Draft tersimpan");
    onClose();
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.6, base64: true });
    if (res.canceled) return;
    const a = res.assets[0];
    const url = a.uri.startsWith("data:") ? a.uri : a.base64 ? `data:${a.mimeType ?? "image/jpeg"};base64,${a.base64}` : undefined;
    if (!url) return toast("Foto tidak bisa dibaca");
    if (url.length > 6.5e6) return toast("Foto terlalu besar (maks 5 MB)");
    setImage(url);
  };
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

  const post = async () => {
    if (!title.trim()) {
      setError("Judulnya jangan kosong ya.");
      return;
    }
    if (busy) return;
    const n = digits(price);
    const porsi = digits(portions);
    setBusy(true);
    const ok = await addPost({
      type: TYPE_OF[mode],
      title: title.trim(),
      body: details.trim(),
      cost: n || null,
      image,
      cook_time: minutes ? `${digits(minutes)} Menit` : null,
      per_portion: n && porsi ? `${rp(Math.round(n / porsi))} / org` : null,
    });
    setBusy(false);
    if (!ok) return;
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
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
              onChange={setMode}
            />
            <Pressable
              role="button"
              aria-label={image ? "Ganti foto" : "Tambah foto masakan"}
              onPress={pickPhoto}
              style={{
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: c.mut,
                borderRadius: 12,
                overflow: "hidden",
                minHeight: 60,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: c.card,
              }}
            >
              {image ? (
                <Image source={{ uri: image }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
              ) : (
                <Txt color={c.mut}>Tambah foto masakan</Txt>
              )}
            </Pressable>
            <Inp
              placeholder={mode === "Tempat" ? "Nama tempat / judul info" : "Judul resep"}
              aria-label="Judul"
              value={title}
              onChangeText={t => {
                setTitle(t);
                if (error) setError("");
              }}
            />
            <View style={row}>
              <Inp placeholder="Waktu (mnt)" aria-label="Waktu (mnt)" keyboardType="number-pad" value={minutes} onChangeText={setMinutes} style={{ flex: 1, width: undefined }} />
              <Inp placeholder="Porsi" aria-label="Porsi" keyboardType="number-pad" value={portions} onChangeText={setPortions} style={{ flex: 1, width: undefined }} />
            </View>
            <View style={row}>
              <Inp placeholder={mode === "Resep" ? "Bahan" : "Detail"} aria-label="Bahan atau detail" value={details} onChangeText={setDetails} style={{ flex: 1, width: undefined }} />
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
              <Btn ghost grow title="Simpan draft" onPress={saveDraft} />
              <Btn grow title={busy ? "Mengirim..." : "Post"} onPress={post} />
            </View>
          </ScrollView>
        </Animated.View>
      </SheetFrame>
    </View>
  );
}
