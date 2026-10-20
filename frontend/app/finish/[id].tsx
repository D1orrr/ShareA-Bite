import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mascot } from "../../components/art";
import { Btn, Card, Col, Icon, Screen, Stamp, Txt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { getRecipe, RECIPES } from "../../data/seed";
import { cost, digits, R } from "../../lib/format";
import { FONT, useT } from "../../theme";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ id: String(r.id) }));
}

export default function Finish() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const { budget, logSpend, toast } = useApp();
  const r = getRecipe(id);
  const [spent, setSpent] = useState(String(cost(r)));
  const amount = digits(spent);
  const drop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drop, { toValue: 1, duration: 900, easing: Easing.bezier(0.3, 1.6, 0.5, 1), useNativeDriver: Platform.OS !== "web" }).start();
  }, [drop]);

  const save = () => {
    logSpend(amount);
    toast("Tercatat. Dompet aman!");
    router.replace("/akun");
  };

  const diff = budget - amount;
  return (
    <Screen focus>
      <Col gap={16} style={{ alignItems: "center", maxWidth: 460, width: "100%", alignSelf: "center", marginTop: 32 }}>
        <Animated.View style={{ opacity: drop, transform: [{ translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }] }}>
          <Icon n="paid" fill size={48} c="#ffb95f" />
        </Animated.View>
        <Mascot size={180} mood="cheer" />
        <Stamp label="HEMAT BANGET!" size={15} style={{ transform: [{ rotate: "3deg" }] }} />
        <Txt v="h1" center accessibilityRole="header">
          Selesai masak!
        </Txt>
        <Card style={{ width: "100%", alignItems: "center" }}>
          <Txt v="cap">Berapa habisnya?</Txt>
          <TextInput
            value={spent}
            onChangeText={setSpent}
            inputMode="numeric"
            accessibilityLabel="Jumlah pengeluaran"
            style={{ fontFamily: FONT.jk7, fontSize: 30, color: t.chili, textAlign: "center", width: "100%", minHeight: 46, outlineWidth: 0 }}
          />
          <Txt v="cap" f="vn7" c={diff >= 0 ? "daun" : "err"}>
            {diff >= 0 ? `Hemat ${R(diff)} dari budget` : `Lewat ${R(-diff)} dari budget`}
          </Txt>
        </Card>
        <Btn size="xl" full title="Catat pengeluaran" onPress={save} />
        <Btn ghost full title="Lewati" onPress={() => router.replace("/home")} />
      </Col>
    </Screen>
  );
}
