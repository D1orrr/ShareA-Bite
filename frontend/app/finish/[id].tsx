import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Mascot } from "../../components/art";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Overlay";
import { nativeDriver, useLayout, useReducedMotion, useTheme } from "../../components/theme";
import { Txt } from "../../components/Txt";
import { Btn, Card, Inp, Screen, Stamp } from "../../components/ui";
import { Recipe, recipePay } from "../../constants/data";
import { STATIC_RECIPE_IDS, useRecipe } from "../../lib/useRecipe";
import { Splash } from "../../components/Splash";
import { fixed, font, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

// One pre-built page per recipe, so direct links work in the web export.
export async function generateStaticParams() {
  return STATIC_RECIPE_IDS;
}

export default function Finish() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRecipe(id);
  if (!r) return <Splash />;
  return <FinishScreen r={r} />;
}

function FinishScreen({ r }: { r: Recipe }) {
  const { c } = useTheme();
  const { h } = useLayout();
  const toast = useToast();
  const reduced = useReducedMotion();
  const { budget, logSpend } = useStore();
  const [spent, setSpent] = useState(String(recipePay(r)));
  const [busy, setBusy] = useState(false);
  const amount = Number(spent.replace(/\D/g, "")) || 0;
  const diff = budget - amount;

  const drop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      drop.setValue(1);
      return;
    }
    Animated.timing(drop, {
      toValue: 1,
      duration: 900,
      easing: Easing.bezier(0.3, 1.6, 0.5, 1),
      useNativeDriver: nativeDriver,
    }).start();
  }, [drop, reduced]);

  const log = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await logSpend(amount, r.id);
    setBusy(false);
    if (!ok) return;
    toast(diff >= 0 ? "Tercatat. Dompet aman!" : "Tercatat. Besok lebih hemat ya!");
    router.dismissTo("/akun");
  };

  return (
    <Screen focus>
      <View style={{ alignItems: "center", maxWidth: 460, width: "100%", alignSelf: "center", marginTop: h * 0.05, gap: 16 }}>
        <Animated.View
          style={{
            opacity: drop.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: "clamp" }),
            transform: [{ translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }],
          }}
        >
          <Icon name="paid" size={48} fill color={fixed.coin} />
        </Animated.View>
        <Mascot size={180} mood="cheer" />
        <Stamp label="HEMAT BANGET!" size={15} rotate="3deg" style={{ alignSelf: "center" }} />
        <Txt v="h1" style={{ textAlign: "center" }}>
          Selesai masak!
        </Txt>
        <Card style={{ width: "100%", alignItems: "center" }}>
          <Txt v="cap">Berapa habisnya?</Txt>
          <Inp
            aria-label="Berapa habisnya?"
            inputMode="numeric"
            value={spent}
            onChangeText={setSpent}
            style={{
              fontFamily: font.head,
              fontSize: 30,
              textAlign: "center",
              color: c.chili,
              fontVariant: ["tabular-nums"],
              marginVertical: 4,
            }}
          />
          <Txt v="cap" b color={diff >= 0 ? c.daun : c.danger}>
            {diff >= 0 ? `Hemat ${rp(diff)} dari budget` : `Lewat ${rp(-diff)} dari budget`}
          </Txt>
        </Card>
        <Btn size="xl" full title="Catat pengeluaran" onPress={log} />
        <Btn ghost full title="Lewati" onPress={() => router.dismissTo("/home")} />
      </View>
    </Screen>
  );
}
