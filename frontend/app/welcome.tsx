import React from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { FoodPlate } from "../components/art";
import { Barcode, Btn, Card, Col, Dashed, Hero, Line, Row, Screen, Stamp, Two, Txt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { useLayout } from "../theme";

export default function Welcome() {
  const router = useRouter();
  const { setGuest } = useApp();
  const { width } = useLayout();
  return (
    <Screen focus>
      <View style={{ minHeight: 520, justifyContent: "center", paddingTop: 24 }}>
        <Two align="center">
          <Col gap={18}>
            <Row>
              <Stamp label="HEMAT!" size={14} style={{ transform: [{ rotate: "-4deg" }] }} />
              <Txt v="cap">Untuk anak kos se-Indonesia</Txt>
            </Row>
            <Txt v="d" accessibilityRole="header">
              Eat well,{"\n"}spend less.
            </Txt>
            <Txt s={18} c="mut" style={{ maxWidth: 420 }}>
              Masukkan budget kamu dalam Rupiah. AI kami menyusun resep yang pas di dompet, sesuai alat masak di kosan.
            </Txt>
            <Row wrap style={{ marginTop: 6 }}>
              <Btn size="xl" title="Daftar dengan email" onPress={() => router.push("/onboard")} />
              <Btn size="xl" ghost title="Lanjut dengan Google" onPress={() => router.push("/onboard")} />
            </Row>
            <Pressable
              accessibilityRole="link"
              style={{ minHeight: 48, justifyContent: "center" }}
              onPress={() => {
                setGuest(true);
                router.replace("/home");
              }}
            >
              <Txt v="cap" s={15} style={{ textDecorationLine: "underline" }}>
                Skip for now, masuk sebagai tamu
              </Txt>
            </Pressable>
          </Col>

          <Hero light style={{ alignItems: "center", gap: 6, minHeight: 400, justifyContent: "center" }}>
            <View style={{ width: Math.min(300, width * 0.7) }}>
              <FoodPlate dish={1} color="#E9A93B" height={300} />
            </View>
            <Card torn style={{ width: "100%", maxWidth: 300, transform: [{ rotate: "2deg" }] }}>
              <Line left="Nasi telur" right="Rp9.500" />
              <Line left="Es teh" right="Rp3.000" />
              <Dashed style={{ marginTop: 6 }} />
              <View style={{ paddingTop: 4 }}>
                <Line left="TOTAL" right="Rp12.500" bold big />
              </View>
              <View style={{ marginTop: 8 }}>
                <Barcode />
              </View>
            </Card>
          </Hero>
        </Two>
      </View>
    </Screen>
  );
}
