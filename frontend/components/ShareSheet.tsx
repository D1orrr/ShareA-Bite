/** Bottom sheet (centered dialog on desktop) for posting to the community. */
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";
import { PostType, PROFILE } from "../data/seed";
import { digits, R } from "../lib/format";
import { C, useLayout, useT } from "../theme";
import { Btn, Col, Icon, IconBtn, Input, Row, Segmented, Txt } from "./ui";

const MODES = ["Resep", "Tips", "Tempat"] as const;
type Mode = (typeof MODES)[number];
const TYPE_OF: Record<Mode, PostType> = { Resep: "Resep", Tips: "Trik Masak", Tempat: "Info Warung" };

export function ShareSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useT();
  const { wide } = useLayout();
  const { addPost, toast, guest } = useApp();
  const [mode, setMode] = useState<Mode>("Resep");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [portions, setPortions] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [err, setErr] = useState("");

  const reset = () => {
    setTitle("");
    setMinutes("");
    setPortions("");
    setIngredients("");
    setPrice("");
    setImage(undefined);
    setErr("");
  };

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const post = () => {
    if (!title.trim()) return setErr("Judulnya jangan kosong ya.");
    const n = digits(price);
    addPost({
      author: guest ? "Kawan" : PROFILE.first,
      campus: "UI Depok",
      type: TYPE_OF[mode],
      title: title.trim(),
      body: ingredients.trim(),
      cost: n || undefined,
      imageUri: image,
      cookTime: minutes ? `${digits(minutes)} Menit` : undefined,
      perPortion: n && digits(portions) ? `${R(n / digits(portions))} / org` : undefined,
    });
    reset();
    onClose();
    toast("Postingan terkirim!");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Tutup"
          style={{ flex: 1, backgroundColor: "rgba(19,27,46,0.5)", justifyContent: wide ? "center" : "flex-end", alignItems: "center" }}
        >
          <Pressable
            onPress={() => {}}
            accessibilityRole="none"
            accessibilityLabel="Share Post"
            style={{ width: "100%", maxWidth: 540, maxHeight: "92%", backgroundColor: t.paper, borderRadius: 24, borderBottomLeftRadius: wide ? 24 : 0, borderBottomRightRadius: wide ? 24 : 0 }}
          >
            <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
              <Col gap={12}>
                <Row sp>
                  <Txt v="h2">Bagikan ke Komunitas</Txt>
                  <IconBtn n="x" label="Tutup" onPress={onClose} c="ink" />
                </Row>
                <Segmented items={MODES} value={mode} onChange={setMode} style={{ maxWidth: undefined }} />
                <Pressable
                  onPress={pick}
                  accessibilityRole="button"
                  style={{ borderWidth: 2, borderStyle: "dashed", borderColor: t.mut, borderRadius: 12, overflow: "hidden", minHeight: 80, alignItems: "center", justifyContent: "center", backgroundColor: t.card }}
                >
                  {image ? (
                    <Image source={{ uri: image }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
                  ) : (
                    <Row>
                      <Icon n="photo" c="mut" />
                      <Txt c="mut">Tambah foto masakan</Txt>
                    </Row>
                  )}
                </Pressable>
                <Input value={title} onChangeText={(v) => (setTitle(v), setErr(""))} placeholder={mode === "Tempat" ? "Nama tempat / judul info" : "Judul resep"} />
                <Row>
                  <View style={{ flex: 1 }}>
                    <Input value={minutes} onChangeText={setMinutes} placeholder="Waktu (mnt)" inputMode="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input value={portions} onChangeText={setPortions} placeholder="Porsi" inputMode="numeric" />
                  </View>
                </Row>
                <Row>
                  <View style={{ flex: 1 }}>
                    <Input value={ingredients} onChangeText={setIngredients} placeholder={mode === "Resep" ? "Bahan" : "Detail"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input value={price} onChangeText={setPrice} placeholder="Harga" inputMode="numeric" />
                  </View>
                </Row>
                <Row sp>
                  <Txt v="cap">Total otomatis</Txt>
                  <View style={{ backgroundColor: t.chili, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 }}>
                    <Txt f="jk7" s={14} c="onp" num>
                      {R(digits(price))}
                    </Txt>
                  </View>
                </Row>
                {err ? (
                  <Txt f="vn7" c="err" accessibilityRole="alert">
                    {err}
                  </Txt>
                ) : null}
                <Row>
                  <Btn grow ghost title="Simpan draft" onPress={() => toast("Draft tersimpan")} />
                  <Btn grow title="Post" onPress={post} />
                </Row>
              </Col>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
