import React, { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Card, Col, Hero, Icon, IconName, Row, Screen, Two, Txt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { PROFILE } from "../../data/seed";
import { R } from "../../lib/format";
import { C, useT, useTheme } from "../../theme";

const CHART_MAX = 20000; // Rp at full chart height
const CHART_H = 150;
const BADGES: [IconName, string][] = [
  ["premium", "Hemat Hero"],
  ["fire", "Spice Lord"],
  ["basket", "Pasar Hunter"],
];

export default function Akun() {
  const router = useRouter();
  const t = useT();
  const { isDark, toggleDark } = useTheme();
  const { history, budget, prefs, saved, setGuest } = useApp();
  const week = history.slice(-7);

  const settings: [string, ReactNode][] = [
    [
      "Dark mode",
      <Pressable
        key="dm"
        onPress={toggleDark}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
        accessibilityLabel="Dark mode"
        style={{ width: 52, height: 30, borderRadius: 99, backgroundColor: isDark ? t.daun : t.bd, justifyContent: "center", paddingHorizontal: 3, alignItems: isDark ? "flex-end" : "flex-start" }}
      >
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff" }} />
      </Pressable>,
    ],
    [
      "Resep tersimpan",
      <Pressable key="rs" onPress={() => router.push("/simpan")} accessibilityRole="link">
        <Txt f="vn7" c="chili">
          Buka
        </Txt>
      </Pressable>,
    ],
    ["Budget harian", <Txt key="b" f="jk7" num>{R(budget)}</Txt>],
    ["Diet", <Txt key="d" v="cap">{prefs.slice(0, 2).join(", ") || "Belum diatur"}</Txt>],
    ["Pengingat udah makan belum", <Txt key="p" f="jk7" num>19.00</Txt>],
  ];

  return (
    <Screen>
      <Two r>
        <Col>
          <Hero light>
            <Row gap={18}>
              <Avatar letter="D" size={80} />
              <View style={{ flex: 1 }}>
                <Txt v="h1">{PROFILE.name}</Txt>
                <Txt v="cap">{PROFILE.campus}</Txt>
                <View style={{ marginTop: 6, alignSelf: "flex-start", backgroundColor: t.kunyit, borderRadius: 8, paddingHorizontal: 10, minHeight: 28, justifyContent: "center" }}>
                  <Txt f="jk6" s={11.5} c="#1C1A17">
                    {PROFILE.level}
                  </Txt>
                </View>
              </View>
            </Row>
          </Hero>

          <Row>
            {[
              [String(PROFILE.shared), "Resep dibagi"],
              [String(saved.length), "Tersimpan"],
              [PROFILE.savedThisMonth, "Hemat bulan ini"],
            ].map(([v, k]) => (
              <Card key={k} style={{ flex: 1, alignItems: "center", padding: 12 }}>
                <Txt f="jk7" s={20} c="daun" num>
                  {v}
                </Txt>
                <Txt v="cap" center>
                  {k}
                </Txt>
              </Card>
            ))}
          </Row>

          <Card>
            <Row sp>
              <Txt f="vn7">Pengeluaran vs budget</Txt>
              <Txt v="cap" num>
                garis = {R(budget)}
              </Txt>
            </Row>
            <View
              accessibilityLabel={`Pengeluaran 7 hari terakhir: ${week.map((v) => R(v)).join(", ")}`}
              style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, height: CHART_H, marginTop: 24, borderBottomWidth: 1, borderColor: t.bd }}
            >
              <View
                style={{ position: "absolute", left: 0, right: 0, bottom: Math.min(1, budget / CHART_MAX) * CHART_H, borderTopWidth: 2, borderStyle: "dashed", borderColor: t.chili }}
              />
              {week.map((v, i) => {
                const color = v > budget ? t.err : v / budget > 0.7 ? t.kunyit : t.daun;
                return (
                  <View key={i} style={{ flex: 1, height: Math.min(1, v / CHART_MAX) * CHART_H, backgroundColor: color, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                    <Txt v="cap" s={10} center num style={{ position: "absolute", top: -18, left: -6, right: -6 }}>
                      {Math.round(v / 1000)}rb
                    </Txt>
                  </View>
                );
              })}
            </View>
          </Card>

          <Row>
            {BADGES.map(([ic, label]) => (
              <Card key={label} style={{ flex: 1, alignItems: "center" }}>
                <Icon n={ic} size={38} c="sec" />
                <Txt f="vn7" s={13} center>
                  {label}
                </Txt>
              </Card>
            ))}
          </Row>
        </Col>

        <Card style={{ paddingVertical: 6, paddingHorizontal: 18 }}>
          <Txt v="h2" style={{ paddingVertical: 14 }}>
            Pengaturan
          </Txt>
          {settings.map(([k, v]) => (
            <Row key={k} sp style={{ minHeight: 54, borderTopWidth: 1, borderColor: t.bd }}>
              <Txt style={{ flex: 1 }}>{k}</Txt>
              {v}
            </Row>
          ))}
          <Pressable
            onPress={() => {
              setGuest(false);
              router.replace("/welcome");
            }}
            accessibilityRole="button"
            style={{ minHeight: 54, borderTopWidth: 1, borderColor: t.bd, justifyContent: "center" }}
          >
            <Txt f="vn7" c="err">
              Logout
            </Txt>
          </Pressable>
        </Card>
      </Two>
    </Screen>
  );
}
