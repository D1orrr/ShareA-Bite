import React, { useState } from "react";
import { View } from "react-native";
import { PostCard } from "../../components/cards";
import { Icon } from "../../components/Icon";
import { useSheet } from "../../components/Overlay";
import { ShareSheet } from "../../components/ShareSheet";
import { useLayout, useTheme } from "../../components/theme";
import { Txt } from "../../components/Txt";
import { alpha } from "../../constants/theme";
import { Avatar, Btn, Card, Chip, Grid, HScroll, Inp, row, Screen, Stamp } from "../../components/ui";
import { POST_FILTERS, postMatches, POSTS } from "../../constants/data";
import { useStore } from "../../context/AppStore";

export default function Komunitas() {
  const { c } = useTheme();
  const { wide } = useLayout();
  const { tab, setTab } = useStore();
  const { openSheet, closeSheet } = useSheet();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const list = POSTS.filter(p => postMatches(p, tab) && p.title.toLowerCase().includes(q));

  return (
    <View style={{ flex: 1 }}>
      <Screen bottom={wide ? 120 : 96}>
        <View style={{ gap: 12 }}>
          <View>
            <Inp
              placeholder="Cari resep hemat atau warung dekat kampus..."
              aria-label="Cari"
              value={query}
              onChangeText={setQuery}
              style={{ paddingLeft: 44 }}
            />
            <View style={{ position: "absolute", left: 12, top: 12, pointerEvents: "none" }}>
              <Icon name="search" color={c.mut} />
            </View>
          </View>

          <HScroll gap={8} style={{ marginHorizontal: -16 }} contentStyle={{ paddingBottom: 4, paddingHorizontal: 16 }}>
            {POST_FILTERS.map(f => (
              <Chip key={f} kind="radio" label={f} on={tab === f} onPress={() => setTab(f)} />
            ))}
          </HScroll>

          <Card flat style={[row, { flexWrap: "wrap", justifyContent: "space-between", backgroundColor: c.sirup }]}>
            <View style={[row, { flexGrow: 1, flexBasis: 150 }]}>
              <Avatar icon="auto_awesome" size={40} />
              <View style={{ flexShrink: 1 }}>
                <Txt v="h3" style={{ fontSize: 16 }}>
                  Rekomendasi Hari Ini
                </Txt>
                <Txt v="cap">Hemat rata-rata Rp18.500/hari anak kos</Txt>
              </View>
            </View>
            <Stamp label="Depok & Sekitarnya" bg={alpha(c.chili, 0.14)} color={c.chili} />
          </Card>

          {list.length ? (
            <Grid>
              {list.map(p => (
                <PostCard key={p.key} p={p} />
              ))}
            </Grid>
          ) : (
            <Card>
              <Txt v="cap">Belum ada postingan di kategori ini.</Txt>
            </Card>
          )}
        </View>
      </Screen>

      <Btn
        icon="add"
        title="Bagikan Resep / Info"
        bg={c.sec}
        fg={c.ons}
        onPress={() => openSheet(<ShareSheet onClose={closeSheet} />)}
        style={{
          position: "absolute",
          right: wide ? 40 : 16,
          bottom: wide ? 32 : 20,
          zIndex: 35,
          minHeight: 48,
          paddingLeft: 14,
          paddingRight: 18,
          boxShadow: "0 10px 24px -6px rgba(0,0,0,0.35)",
        }}
      />
    </View>
  );
}
