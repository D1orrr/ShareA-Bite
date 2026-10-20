import React from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { FoodPhoto } from "../components/art";
import { useLayout, useTheme } from "../components/theme";
import { B, Txt } from "../components/Txt";
import { Barcode, Btn, Card, Hero, LineRow, row, Rule, Screen, Stamp, Two, wrap } from "../components/ui";
import { useStore } from "../context/AppStore";

export default function Welcome() {
  const { c } = useTheme();
  const { h, wide } = useLayout();
  const { setGuest } = useStore();

  return (
    <Screen focus>
      <Two style={[{ minHeight: h * 0.86, justifyContent: "center" }, wide && { alignItems: "center" }]}>
        <View style={{ gap: 18 }}>
          <View style={row}>
            <Stamp label="HEMAT!" size={14} rotate="-4deg" />
            <Txt v="cap">Untuk anak kos se-Indonesia</Txt>
          </View>
          <Txt v="d">Eat well,{"\n"}spend less.</Txt>
          <Txt color={c.mut} style={{ fontSize: 18, lineHeight: 28, maxWidth: 360 }}>
            Masukkan budget kamu dalam Rupiah. AI kami menyusun resep yang pas di dompet, sesuai alat masak di kosan.
          </Txt>
          <View style={[row, wrap, { marginTop: 6 }]}>
            <Btn size="xl" title="Daftar dengan email" onPress={() => router.push("/onboard")} />
            <Btn size="xl" ghost title="Lanjut dengan Google" onPress={() => router.push("/onboard")} />
          </View>
          <Pressable
            role="button"
            onPress={() => {
              setGuest(true);
              router.push("/home");
            }}
            style={{ minHeight: 48, justifyContent: "center", alignSelf: "flex-start" }}
          >
            <Txt v="cap" style={{ fontSize: 15, lineHeight: 23, textDecorationLine: "underline" }}>
              Skip for now, masuk sebagai tamu
            </Txt>
          </Pressable>
        </View>

        <Hero lt style={{ alignItems: "center", justifyContent: "center", gap: 6, minHeight: 400 }}>
          <FoodPhoto art={1} color="#E9A93B" width="70%" maxWidth={300} height={300} />
          <WelcomeReceipt />
        </Hero>
      </Two>
    </Screen>
  );
}

// Split out so useTheme() returns the panel's colors.
function WelcomeReceipt() {
  const { c } = useTheme();
  return (
    <Card torn style={{ width: "100%", maxWidth: 300, transform: [{ rotate: "2deg" }] }}>
      <LineRow label="Nasi telur" value="Rp9.500" />
      <LineRow label="Es teh" value="Rp3.000" />
      <Rule dashed color={c.mut} style={{ marginTop: 6 }} />
      <LineRow style={{ paddingTop: 8 }} label={<B>TOTAL</B>} value="Rp12.500" valueStyle={{ color: c.chili, fontSize: 18 }} />
      <Barcode style={{ marginTop: 8 }} />
    </Card>
  );
}
