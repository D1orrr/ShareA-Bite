import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Mascot } from "../components/art";
import { goBack } from "../components/nav";
import { useLayout, useTheme } from "../components/theme";
import { Txt } from "../components/Txt";
import { Bar, Btn, Card, Check, row, Screen, Sticky } from "../components/ui";
import { rp } from "../constants/theme";
import { useStore } from "../context/AppStore";

const STEP_AT = [500, 1300, 2200];

export default function Loading() {
  const { c } = useTheme();
  const { h } = useLayout();
  const { budget, generate } = useStore();
  const [done, setDone] = useState(-1);
  const [bar, setBar] = useState(4);
  // The real request runs alongside the checklist; we only leave once both are done.
  const result = useRef<Promise<unknown> | null>(null);
  useEffect(() => {
    result.current = generate(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;
    const next = () => {
      if (i < 3) {
        setDone(i);
        setBar((i + 1) * 32);
        const wait = STEP_AT[i] - (STEP_AT[i - 1] ?? 0) + 250;
        i++;
        timers.push(setTimeout(next, wait));
      } else {
        result.current!.then(res => {
          if (!res) return router.dismissTo("/home");
          setBar(100);
          timers.push(setTimeout(() => router.dismissTo("/results"), 350));
        });
      }
    };
    next();
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = ["Cek harga pasar Depok", "Pilih bahan sesuai alat masak", `Hitung struk, pastikan ${rp(budget)} cukup`];

  return (
    <Screen focus>
      <View style={{ alignItems: "center", maxWidth: 480, width: "100%", alignSelf: "center", marginTop: h * 0.06, gap: 18 }}>
        <Mascot size={190} mood="cook" />
        <Txt v="h1" style={{ textAlign: "center" }} aria-live="polite">
          Lagi masak ide buat kamu...
        </Txt>
        <Card style={{ width: "100%" }}>
          <View style={{ gap: 12 }}>
            {steps.map((s, i) => (
              <View key={s} style={[row, { opacity: i <= done ? 1 : 0.4 }]}>
                <Check on={i <= done} />
                <Txt style={{ flexShrink: 1 }}>{s}</Txt>
              </View>
            ))}
          </View>
          <Bar pct={bar} color={c.chili} label="Progres" style={{ marginTop: 16 }} />
        </Card>
        <Sticky style={{ width: "100%" }}>Tips: telur dadar plus nasi hangat itu kombo paling aman buat akhir bulan.</Sticky>
        <Btn ghost size="s" title="Batal" onPress={goBack} />
      </View>
    </Screen>
  );
}
