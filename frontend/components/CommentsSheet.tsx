import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fixed } from "../constants/theme";
import { useStore } from "../context/AppStore";
import type { Comment } from "../lib/api";
import { Icon } from "./Icon";
import { nativeDriver, useLayout, useTheme } from "./theme";
import { Txt } from "./Txt";
import { Avatar, between, Btn, Inp, row } from "./ui";

const SheetFrame = Platform.OS === "ios" ? KeyboardAvoidingView : View;
const styles = StyleSheet.create({ passThrough: { pointerEvents: "box-none" } });

/** Bottom sheet (centered dialog on desktop) with a post's comments and a reply box. */
export function CommentsSheet({ postKey, title, onClose }: { postKey: string; title: string; onClose: () => void }) {
  const { c } = useTheme();
  const { wide } = useLayout();
  const insets = useSafeAreaInsets();
  const { getComments, addComment } = useStore();
  const [list, setList] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 300, useNativeDriver: nativeDriver }).start();
    getComments(postKey).then(setList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postKey]);

  // Android back button and Escape on the web close the sheet.
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

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await addComment(postKey, text.trim());
    setSending(false);
    if (res) {
      setList(res);
      setText("");
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 80 }]}>
      <Pressable
        accessible={false}
        focusable={false}
        onPress={onClose}
        style={[StyleSheet.absoluteFill, { backgroundColor: fixed.backdrop }, Platform.OS === "web" && ({ backdropFilter: "blur(4px)" } as ViewStyle)]}
      />
      <SheetFrame behavior="padding" style={[styles.passThrough, { flex: 1, justifyContent: wide ? "center" : "flex-end", alignItems: "center" }]}>
        <Animated.View
          role="dialog"
          aria-modal
          aria-label="Komentar"
          style={{
            backgroundColor: c.paper,
            width: "100%",
            maxWidth: 540,
            maxHeight: "85%",
            borderRadius: 24,
            borderBottomLeftRadius: wide ? 24 : 0,
            borderBottomRightRadius: wide ? 24 : 0,
            overflow: "hidden",
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          }}
        >
          <View style={{ padding: 20, paddingBottom: 20 + (wide ? 0 : insets.bottom), gap: 12 }}>
            <View style={[row, between]}>
              <View style={{ flexShrink: 1 }}>
                <Txt v="h2">Komentar</Txt>
                <Txt v="cap" numberOfLines={1}>
                  {title}
                </Txt>
              </View>
              <Pressable
                role="button"
                aria-label="Tutup"
                onPress={onClose}
                style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="close" color={c.ink} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 12 }}>
              {list === null ? (
                <ActivityIndicator color={c.chili} />
              ) : list.length ? (
                list.map(cm => (
                  <View key={cm.id} style={[row, { alignItems: "flex-start" }]}>
                    <Avatar label={cm.author.charAt(0)} size={34} fontSize={13} />
                    <View style={{ flex: 1, backgroundColor: c.card, borderRadius: 12, padding: 10 }}>
                      <View style={[row, between]}>
                        <Txt b style={{ fontSize: 13 }}>
                          {cm.author}
                        </Txt>
                        <Txt v="cap" style={{ fontSize: 11 }}>
                          {cm.time}
                        </Txt>
                      </View>
                      <Txt style={{ fontSize: 14 }}>{cm.text}</Txt>
                    </View>
                  </View>
                ))
              ) : (
                <Txt v="cap">Belum ada komentar. Jadi yang pertama!</Txt>
              )}
            </ScrollView>
            <Inp value={text} onChangeText={setText} placeholder="Tulis komentar..." aria-label="Komentar" onSubmitEditing={send} />
            <Btn title={sending ? "Mengirim..." : "Kirim"} onPress={send} />
          </View>
        </Animated.View>
      </SheetFrame>
    </View>
  );
}
