import React from "react";
import { Pressable, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Icon, IconName } from "../../components/Icon";
import { useLayout, useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import { Avatar, between, Card, Chip, Hero, row, Rule, Screen, Two } from "../../components/ui";
import { amountEm, fixed, font, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

const STATS = [
  ["12", "Resep dibagi"],
  ["34", "Tersimpan"],
  ["Rp148rb", "Hemat bulan ini"],
];

const BADGES: [IconName, string][] = [
  ["workspace_premium", "Hemat Hero"],
  ["local_fire_department", "Spice Lord"],
  ["shopping_basket", "Pasar Hunter"],
];

const CHART_MAX = 20000;

export default function Akun() {
  const { c, dark, toggleDark } = useTheme();
  const { w, wide } = useLayout();
  const { budget, hist, pick } = useStore();
  const week = hist.slice(-7);

  // Shrinks "Rp148rb" so it fits its card on small phones.
  const statInner = (wide ? 0 : (w - 32 - 20) / 3) - 24;
  const statSize = wide ? 20 : Math.min(20, Math.floor(statInner / amountEm("Rp148rb")));

  const settings: [string, React.ReactNode][] = [
    [
      "Dark mode",
      <Pressable
        key="dark"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        onPress={toggleDark}
        hitSlop={8}
        style={{ width: 52, height: 30, borderRadius: 99, backgroundColor: dark ? c.daun : c.bd }}
      >
        <View
          style={{
            position: "absolute",
            top: 3,
            left: dark ? undefined : 3,
            right: dark ? 3 : undefined,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "#ffffff",
          }}
        />
      </Pressable>,
    ],
    [
      "Resep tersimpan",
      <Link key="saved" href="/simpan" style={{ fontFamily: font.bodyBold, fontSize: 13, color: c.chili, textDecorationLine: "underline" }}>
        Buka
      </Link>,
    ],
    ["Budget harian", <Txt key="b" v="cap" b m color={c.mut}>{rp(budget)}</Txt>],
    ["Diet", <Txt key="d" v="cap">{pick.slice(0, 2).join(", ") || "Belum diatur"}</Txt>],
    ["Pengingat udah makan belum", <Txt key="r" v="cap" b m color={c.mut}>19.00</Txt>],
  ];

  return (
    <Screen>
      <Two r>
        <View style={{ gap: 14 }}>
          <Hero lt style={[row, { gap: 18 }]}>
            <Avatar label="D" size={80} fontSize={32} />
            <View style={{ flex: 1 }}>
              <Txt v="h1">Dinda Aprilia</Txt>
              <Txt v="cap">Universitas Indonesia, Depok</Txt>
              <Chip sw label="Lv.3 Anak Kos Pintar" bg={c.kunyit} fg={fixed.levelInk} style={{ marginTop: 6, alignSelf: "flex-start" }} />
            </View>
          </Hero>

          <View style={row}>
            {STATS.map(([value, label]) => (
              <Card key={label} style={{ flex: 1, alignItems: "center", padding: 12 }}>
                <Txt b m color={c.daun} style={{ fontSize: statSize, lineHeight: Math.round(statSize * 1.4) }}>
                  {value}
                </Txt>
                <Txt v="cap" style={{ textAlign: "center" }}>
                  {label}
                </Txt>
              </Card>
            ))}
          </View>

          <Card>
            <View style={[row, between]}>
              <Txt>
                <B>Pengeluaran vs budget</B>
              </Txt>
              <Txt v="cap" m>
                garis = {rp(budget)}
              </Txt>
            </View>
            <View
              role="img"
              aria-label={`Pengeluaran ${week.length} hari terakhir: ${week.map(v => Math.round(v / 1000) + " ribu").join(", ")}`}
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 10,
                height: 150,
                marginTop: 14,
                borderBottomWidth: 1,
                borderBottomColor: c.bd,
              }}
            >
              <Rule
                dashed
                color={c.chili}
                style={{ position: "absolute", left: 0, right: 0, bottom: `${(budget / CHART_MAX) * 100}%` }}
              />
              {week.map((v, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.min(100, (v / CHART_MAX) * 100)}%`,
                    backgroundColor: v > budget ? c.err : v / budget > 0.7 ? c.kunyit : c.daun,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      position: "absolute",
                      top: -18,
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      fontFamily: font.headMedium,
                      fontSize: 10,
                      color: c.mut,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {Math.round(v / 1000)}rb
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={row}>
            {BADGES.map(([icon, label]) => (
              <Card key={label} style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", columnGap: 4 }}>
                <Icon name={icon} size={38} fill color={c.sec} />
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: c.ink, textAlign: "center" }}>{label}</Text>
              </Card>
            ))}
          </View>
        </View>

        <Card style={{ paddingVertical: 6, paddingHorizontal: 18 }}>
          <Txt v="h2" style={{ paddingVertical: 14 }}>
            Pengaturan
          </Txt>
          {settings.map(([label, control]) => (
            <View key={label} style={[row, between, { minHeight: 54, borderTopWidth: 1, borderTopColor: c.bd }]}>
              <Txt style={{ flexShrink: 1 }}>{label}</Txt>
              {control}
            </View>
          ))}
          <Pressable
            role="button"
            onPress={() => router.dismissTo("/")}
            style={{ minHeight: 54, justifyContent: "center", borderTopWidth: 1, borderTopColor: c.bd }}
          >
            <Txt b color={c.danger}>
              Logout
            </Txt>
          </Pressable>
        </Card>
      </Two>
    </Screen>
  );
}
