import React, { useEffect, useRef, useState } from "react";
import { Pressable, Vibration, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Btn, Card, Icon, IconBtn, Row, Screen, Sticky, Txt, Col } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { getRecipe, RECIPES } from "../../data/seed";
import { mmss } from "../../lib/format";
import { FONT, clamp, useLayout, useT } from "../../theme";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ id: String(r.id) }));
}

/** Full-screen, one-step-at-a-time cooking mode with a per-step timer. */
export default function Cook() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const { width } = useLayout();
  const { toast } = useApp();
  const r = getRecipe(id);
  const n = r.steps.length;
  const [si, setSi] = useState(0);
  const step = r.steps[si];
  const [left, setLeft] = useState(step.seconds);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => {
    stop();
    setLeft(r.steps[si].seconds);
  }, [si, r]);
  useEffect(() => stop, []);

  const start = () => {
    if (timer.current) return;
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          stop();
          Vibration.vibrate(300);
          toast("Timer selesai!");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const next = () => (si < n - 1 ? setSi(si + 1) : router.replace(`/finish/${r.id}`));
  const exit = () => (router.canGoBack() ? router.back() : router.replace(`/recipe/${r.id}`));

  return (
    <Screen focus>
      <Col style={{ maxWidth: 720, width: "100%", alignSelf: "center" }}>
        <Row sp>
          <IconBtn n="x" label="Keluar" bg="card" c="ink" size={48} onPress={exit} />
          <Row gap={6}>
            {r.steps.map((_, i) => (
              <View key={i} style={{ width: i === si ? 36 : 14, height: 9, borderRadius: 9, backgroundColor: i <= si ? t.chili : t.bd }} />
            ))}
          </Row>
          <Txt v="cap" num>
            {si + 1}/{n}
          </Txt>
        </Row>

        <Txt v="cap" style={{ marginTop: 12 }}>
          Langkah {si + 1} dari {n}
        </Txt>
        <Txt v="h1" s={clamp(32, width * 0.06, 52)} style={{ lineHeight: Math.round(clamp(32, width * 0.06, 52) * 1.12) }} accessibilityRole="header">
          {step.text}
        </Txt>

        {step.seconds ? (
          <Row>
            <Pressable
              onPress={start}
              accessibilityRole="button"
              accessibilityLabel="Mulai timer"
              style={{ minHeight: 60, paddingHorizontal: 26, borderRadius: 8, backgroundColor: t.ink, flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Icon n="clock" c="paper" />
              <Txt c="paper" style={{ fontFamily: FONT.jk5, fontSize: 30, lineHeight: 36 }} num accessibilityLiveRegion="polite">
                {mmss(left)}
              </Txt>
            </Pressable>
            <Txt v="cap">Tap untuk mulai</Txt>
          </Row>
        ) : null}

        <Sticky size={17}>{r.tip}</Sticky>
        <Txt v="cap" f="vn7" style={{ marginTop: 6 }}>
          Bahan di langkah ini
        </Txt>
        <Row wrap>
          {r.ingredients.slice(si * 2, si * 2 + 3).map((x) => (
            <Card key={x.name} style={{ flexGrow: 1, flexBasis: 110, minWidth: 110 }}>
              <Txt f="vn7">{x.name}</Txt>
              <Txt v="cap" num>
                {x.qty} {x.unit}
              </Txt>
            </Card>
          ))}
        </Row>

        <Row style={{ marginTop: 14 }}>
          {si ? <Btn ghost title="Kembali" onPress={() => setSi(si - 1)} /> : null}
          <Btn grow size="xl" title={si < n - 1 ? "Langkah berikutnya" : "Selesai masak"} onPress={next} />
        </Row>
      </Col>
    </Screen>
  );
}
