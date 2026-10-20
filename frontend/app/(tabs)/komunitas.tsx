import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { PostCard } from "../../components/blocks";
import { ShareSheet } from "../../components/ShareSheet";
import { Avatar, Btn, Card, Chip, Col, Grid, Icon, Input, Row, Screen, Stamp, Txt, hexA } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Post } from "../../data/seed";
import { C, useLayout, useT } from "../../theme";

const TABS = ["Semua", "Di bawah Rp10k", "Info Warung Murah", "Trik Kos"] as const;
type Tab = (typeof TABS)[number];

const matches = (p: Post, tab: Tab) =>
  tab === "Semua" ||
  (tab === "Di bawah Rp10k" && !!p.cost && p.cost < 10000) ||
  (tab === "Info Warung Murah" && p.type === "Info Warung") ||
  (tab === "Trik Kos" && p.type === "Trik Masak");

export default function Komunitas() {
  const t = useT();
  const { wide, pad } = useLayout();
  const { posts } = useApp();
  const [tab, setTab] = useState<Tab>("Semua");
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState(false);
  const list = posts.filter((p) => matches(p, tab) && p.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Col gap={12}>
          <View>
            <Input
              value={q}
              onChangeText={setQ}
              placeholder="Cari resep hemat atau warung dekat kampus..."
              accessibilityLabel="Cari"
              style={{ paddingLeft: 44 }}
            />
            <View pointerEvents="none" style={{ position: "absolute", left: 12, top: 12 }}>
              <Icon n="search" c="mut" />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -pad }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: pad, paddingVertical: 4 }}
          >
            {TABS.map((x) => (
              <Chip key={x} label={x} on={tab === x} onPress={() => setTab(x)} />
            ))}
          </ScrollView>

          <Card flat style={{ backgroundColor: t.sirup }}>
            <Row sp wrap>
              <Row style={{ flexShrink: 1 }}>
                <Avatar size={40}>
                  <Icon n="spark" c={C.avatarInk} />
                </Avatar>
                <View style={{ flexShrink: 1 }}>
                  <Txt v="h3" s={16}>
                    Rekomendasi Hari Ini
                  </Txt>
                  <Txt v="cap">Hemat rata-rata Rp18.500/hari anak kos</Txt>
                </View>
              </Row>
              <Stamp label="Depok & Sekitarnya" color="chili" bg={hexA(t.chili, 0.14)} />
            </Row>
          </Card>

          {list.length ? (
            <Grid>
              {list.map((p) => (
                <PostCard key={p.id} p={p} />
              ))}
            </Grid>
          ) : (
            <Card>
              <Txt v="cap">Belum ada postingan di kategori ini.</Txt>
            </Card>
          )}
        </Col>
      </Screen>

      <Btn
        icon="plus"
        title="Bagikan Resep / Info"
        bg={t.sec}
        fg={t.ons}
        onPress={() => setSheet(true)}
        style={{
          position: "absolute",
          right: wide ? 40 : 16,
          bottom: wide ? 32 : 20,
          minHeight: 48,
          paddingLeft: 14,
          paddingRight: 18,
          boxShadow: "0 10px 24px -6px rgba(0,0,0,0.35)",
        }}
      />
      <ShareSheet visible={sheet} onClose={() => setSheet(false)} />
    </View>
  );
}
