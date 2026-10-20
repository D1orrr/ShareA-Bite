import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { FoodPlate, Mascot } from "../../components/art";
import {
  Avatar,
  Btn,
  Card,
  Chip,
  Chips,
  Col,
  FitPxl,
  Grid,
  Hero,
  Icon,
  IconName,
  Row,
  Screen,
  Slider,
  Stamp,
  Sticky,
  Two,
  Txt,
  useCountUp,
} from "../../components/ui";
import { BUDGET_MAX, BUDGET_MIN, useApp } from "../../context/AppContext";
import { RECIPES, TODAY_SPENT, PROFILE } from "../../data/seed";
import { budgetStatus, cost, R } from "../../lib/format";
import { useLayout, useT } from "../../theme";

const PRESETS = [10000, 15000, 25000];
/** Status colours readable on the green hero. */
const HERO_STATUS = { daun: "#ffffff", kunyit: "#ffb95f", err: "#ffb4ab" } as const;
const FILTERS =["High protein", "Pedas", "Maks 20 mnt", "1 porsi", "Bahan ada"];

export default function Home() {
  const router = useRouter();
  const { budget, setBudget, prefs, togglePref, guest, toast } = useApp();
  const shown = useCountUp(budget);
  const st = budgetStatus(TODAY_SPENT, budget);

  return (
    <Screen>
      <Row sp style={{ marginBottom: 18 }}>
        <View>
          <Txt v="cap">Selamat pagi{guest ? ", tamu" : ""}</Txt>
          <Txt v="h1" accessibilityRole="header">
            Halo, {guest ? "Kawan" : PROFILE.first}
          </Txt>
        </View>
        <Avatar letter={guest ? "?" : "D"} />
      </Row>

      <Two r>
        <Hero>
          <Col gap={16}>
            <Row sp wrap>
              <Txt f="vn7" s={13}>
                Budget makan hari ini
              </Txt>
              <Stamp label={st.label.toUpperCase()} color={HERO_STATUS[st.color]}bg="rgba(255,255,255,0.16)" />
            </Row>
            <Row gap={14}>
              <Btn size="s" ghost title="−" label="Kurangi" style={{ minWidth: 48, paddingHorizontal: 0 }} onPress={() => setBudget(budget - 1000)} />
              <FitPxl style={{ flex: 1, minWidth: 0 }}>{R(shown)}</FitPxl>
              <Btn size="s" ghost title="+" label="Tambah" style={{ minWidth: 48, paddingHorizontal: 0 }} onPress={() => setBudget(budget + 1000)} />
            </Row>
            <Slider min={BUDGET_MIN} max={BUDGET_MAX} step={1000} value={budget} onChange={setBudget} label="Budget" />

            {/* Group 1: budget presets */}
            <Col gap={8}>
              <GroupLabel icon="payments">Pilih cepat budget</GroupLabel>
              <Row wrap>
                {PRESETS.map((b) => (
                  <Chip key={b} label={R(b)} on={budget === b} onPress={() => setBudget(b)} />
                ))}
                <Chip label="Custom" onPress={() => toast("Geser slider untuk budget custom")} />
              </Row>
            </Col>

            {/* Group 2: taste / time / portion preferences, visually separated */}
            <View style={{ borderTopWidth: 1, borderColor: "rgba(255,255,255,0.22)", paddingTop: 16, gap: 8 }}>
              <GroupLabel icon="tune">Preferensi masak</GroupLabel>
              <Chips round items={FILTERS} isOn={(x) => prefs.includes(x)} onToggle={togglePref} />
            </View>
            <Btn size="xl" full icon="spark" title="Generate Recipe" onPress={() => router.push("/loading")} />
          </Col>
        </Hero>

        <Col>
          <Sticky>
            <Txt f="vn7" c="#2a1700">
              Tip hari ini
            </Txt>
            <Txt f="vn5" c="#2a1700">
              Beli bumbu per ons, bukan per bungkus. Dompet aman sampai akhir bulan.
            </Txt>
          </Sticky>
          <Card>
            <Row gap={14}>
              <Mascot size={76} />
              <View style={{ flex: 1 }}>
                <Txt v="h3">Si Mangkok siap masak</Txt>
                <Txt v="cap">Tekan Generate, 3 resep muncul dalam hitungan detik.</Txt>
              </View>
            </Row>
          </Card>
        </Col>
      </Two>

      <Row sp style={{ marginTop: 30, marginBottom: 8 }}>
        <Txt v="h2">Pilihan Hemat Hari Ini</Txt>
        <Pressable onPress={() => router.push("/simpan")} accessibilityRole="link">
          <Txt v="cap" f="vn7">
            Lihat semua
          </Txt>
        </Pressable>
      </Row>
      <TodayStrip />
    </Screen>
  );
}

/** Small uppercase label that heads each filter group in the hero. */
function GroupLabel({ icon, children }: { icon: IconName; children: string }) {
  return (
    <Row gap={6}>
      <Icon n={icon} size={16} c="mut" />
      <Txt f="jk7" s={11} c="mut" style={{ letterSpacing: 0.9 }}>
        {children.toUpperCase()}
      </Txt>
    </Row>
  );
}

function TodayStrip() {
  const t = useT();
  const router = useRouter();
  const { wide } = useLayout();
  const cards = RECIPES.map((r) => (
    <Pressable
      key={r.id}
      onPress={() => router.push(`/recipe/${r.id}`)}
      accessibilityRole="link"
      style={{ width: wide ? "100%" : 210, padding: 10, borderRadius: 12, backgroundColor: t.card, boxShadow: `0 1px 3px ${t.sh}` }}
    >
      <FoodPlate dish={r.id} color={r.color} height={wide ? 150 : 110} />
      <Txt v="h3" s={16} style={{ marginTop: 10, marginBottom: 4 }}>
        {r.title}
      </Txt>
      <Txt f="jk7" c="chili" num>
        {R(cost(r))}
      </Txt>
    </Pressable>
  ));
  // Desktop: spread evenly across the full width. Mobile: swipeable strip.
  if (wide) return <Grid min={300}>{cards}</Grid>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4, paddingHorizontal: 2, paddingBottom: 12 }}>
      {cards}
    </ScrollView>
  );
}
