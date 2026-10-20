import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, Vibration, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Icon } from "../../components/Icon";
import { goBack } from "../../components/nav";
import { useToast } from "../../components/Overlay";
import { useLayout, useTheme } from "../../components/theme";
import { B, Txt, useType } from "../../components/Txt";
import { between, Btn, Card, RoundBtn, row, Screen, Sticky, wrap } from "../../components/ui";
import { formatTimer, Recipe } from "../../constants/data";
import { STATIC_RECIPE_IDS, useRecipe } from "../../lib/useRecipe";
import { Splash } from "../../components/Splash";
import { clamp, font } from "../../constants/theme";

// One pre-built page per recipe, so direct links work in the web export.
export async function generateStaticParams() {
  return STATIC_RECIPE_IDS;
}

export default function Cook() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRecipe(id);
  if (!r) return <Splash />;
  return <CookMode r={r} />;
}

function CookMode({ r }: { r: Recipe }) {
  const { c } = useTheme();
  const { w } = useLayout();
  const t = useType();
  const toast = useToast();
  const [si, setSi] = useState(0);
  const [left, setLeft] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stopTimer, []);

  const n = r.steps.length;
  const step = r.steps[si];
  // Backend recipes say which step uses each ingredient; the samples fall back to slices.
  const hasSteps = r.ing.some(x => x.step !== undefined);
  const stepIng = hasSteps ? r.ing.filter(x => x.step === si) : r.ing.slice(si * 2, si * 2 + 3);

  const startTimer = () => {
    if (timer.current) return;
    let sec = step.sec;
    setLeft(sec);
    timer.current = setInterval(() => {
      sec--;
      setLeft(sec);
      if (sec <= 0) {
        stopTimer();
        Vibration.vibrate(300);
        toast("Timer selesai!");
      }
    }, 1000);
  };

  const go = (to: number) => {
    stopTimer();
    setLeft(null);
    setSi(to);
  };

  return (
    <Screen focus>
      <View style={{ maxWidth: 720, width: "100%", alignSelf: "center", gap: 14 }}>
        <View style={[row, between]}>
          <RoundBtn icon="close" label="Keluar" onPress={goBack} />
          <View style={[row, { gap: 6 }]} aria-hidden>
            {r.steps.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === si ? 36 : 14,
                  height: 9,
                  borderRadius: 9,
                  backgroundColor: i <= si ? c.chili : c.bd,
                }}
              />
            ))}
          </View>
          <Txt v="cap" m>
            {si + 1}/{n}
          </Txt>
        </View>

        <Txt v="cap" style={{ marginTop: 12 }}>
          Langkah {si + 1} dari {n}
        </Txt>
        <Txt v="h1" style={t.head(clamp(32, 0.06 * w, 52), 1.12)}>
          {step.text}
        </Txt>

        {step.sec ? (
          <View style={row}>
            <Pressable
              role="button"
              aria-label={`Timer ${formatTimer(left ?? step.sec)}, tap untuk mulai`}
              onPress={startTimer}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                minHeight: 60,
                paddingHorizontal: 26,
                borderRadius: 8,
                backgroundColor: c.ink,
              }}
            >
              <Icon name="schedule" color={c.paper} />
              <Text style={{ fontFamily: font.headMedium, fontSize: 30, color: c.paper, fontVariant: ["tabular-nums"] }}>
                {formatTimer(left ?? step.sec)}
              </Text>
            </Pressable>
            <Txt v="cap">Tap untuk mulai</Txt>
          </View>
        ) : null}

        <Sticky size={17}>{r.tip}</Sticky>
        <Txt v="cap" b style={{ marginTop: 6 }}>
          Bahan di langkah ini
        </Txt>
        {stepIng.length ? null : <Txt v="cap">Pakai bahan dari langkah sebelumnya.</Txt>}
        <View style={[row, wrap]}>
          {stepIng.map(x => (
            <Card key={x.name} style={{ flexGrow: 1, flexBasis: 110 }}>
              <Txt>
                <B>{x.name}</B>
              </Txt>
              <Txt v="cap" m>
                {+x.qty.toFixed(2)} {x.unit}
              </Txt>
            </Card>
          ))}
        </View>

        <View style={[row, { marginTop: 14 }]}>
          {si ? <Btn ghost title="Kembali" onPress={() => go(si - 1)} /> : null}
          <Btn
            size="xl"
            grow
            title={si < n - 1 ? "Langkah berikutnya" : "Selesai masak"}
            onPress={() => (si < n - 1 ? go(si + 1) : (stopTimer(), router.replace(`/finish/${r.id}`)))}
          />
        </View>
      </View>
    </Screen>
  );
}
