import React from "react";
import { Pressable, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Icon, IconName } from "../../components/Icon";
import { useLayout, useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import { Avatar, Bar, between, Card, Chip, Hero, row, Rule, Screen, Two } from "../../components/ui";
import { amountEm, fixed, font, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const rk = (n: number) => (n >= 1000 ? `Rp${Math.round(n / 1000)}rb` : rp(n));

export default function Akun() {
  const { c, dark, toggleDark } = useTheme();
  const { w, wide } = useLayout();
  const { budget, pick, user, stats, guest, mode, logout } = useStore();
  const history = stats?.history ?? [];
  const week = history.map(h => h.amount);
  // Scale the chart so the tallest bar and the budget line both fit
  const CHART_MAX = Math.max(20000, budget, ...week) * 1.1;
  const STATS = [
    [String(stats?.shared_count ?? 0), "Resep dibagi"],
    [String(stats?.saved_count ?? 0), "Tersimpan"],
    [rk(stats?.saved_this_month ?? 0), "Hemat bulan ini"],
  ];
  const name = guest ? "Tamu" : user?.name ?? "";
  const campus = user?.campus || (guest ? "Daftar supaya datamu tersimpan aman" : "Kampus belum diisi");

  // Shrinks "Rp148rb" so it fits its card on small phones.
  const statInner = (wide ? 0 : (w - 32 - 20) / 3) - 24;
  const statSize = wide ? 20 : Math.min(20, Math.floor(statInner / amountEm(STATS[2][0])));

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
    [
      "Budget harian",
      <Link key="b" href="/home" style={{ fontFamily: font.bodyBold, fontSize: 13, color: c.mut }}>
        {rp(budget)}
      </Link>,
    ],
    [
      "Diet & preferensi",
      <Link key="d" href="/onboard?step=2" numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: c.mut, maxWidth: 170 }}>
        {pick.slice(0, 3).join(", ") || "Belum diatur"}
      </Link>,
    ],
    [
      "Alergi",
      <Link key="a" href="/onboard?step=2" style={{ fontFamily: font.body, fontSize: 13, color: c.mut }}>
        {user?.allergies || "-"}
      </Link>,
    ],
    ["Pengingat udah makan belum", <Txt key="r" v="cap" b m color={c.mut}>{(user?.reminder_time ?? "19:00").replace(":", ".")}</Txt>],
    [
      "Server",
      <Txt key="s" v="cap" b color={mode === "online" ? c.daun : c.danger}>
        {mode === "online" ? "Terhubung" : "Offline (data contoh)"}
      </Txt>,
    ],
  ];

  return (
    <Screen>
      <Two r>
        <View style={{ gap: 14 }}>
          <Hero lt style={[row, { gap: 18 }]}>
            <Avatar label={guest ? "?" : name.charAt(0).toUpperCase()} size={80} fontSize={32} />
            <View style={{ flex: 1 }}>
              <Txt v="h1">{name}</Txt>
              <Txt v="cap">{campus}</Txt>
              <Chip
                sw
                label={stats?.level_title ?? "Lv.1 Anak Kos Baru"}
                bg={c.kunyit}
                fg={fixed.levelInk}
                style={{ marginTop: 6, alignSelf: "flex-start" }}
              />
              {stats ? (
                <View style={{ marginTop: 8 }}>
                  <Bar pct={stats.xp % 100} color={c.kunyit} height={6} label="XP" />
                  <Txt v="cap" style={{ fontSize: 11 }}>
                    {stats.xp} XP · {stats.next_level_xp - stats.xp} XP lagi ke level berikutnya
                  </Txt>
                </View>
              ) : null}
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
              aria-label={
                week.length
                  ? `Pengeluaran ${week.length} hari terakhir: ${week.map(v => Math.round(v / 1000) + " ribu").join(", ")}`
                  : "Belum ada catatan pengeluaran"
              }
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
                  key={history[i].date}
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
            {week.length ? (
              <View style={[row, { gap: 10, marginTop: 4 }]}>
                {history.map(h => (
                  <Text key={h.date} style={{ flex: 1, textAlign: "center", fontFamily: font.body, fontSize: 10, color: c.mut }}>
                    {DAYS[new Date(h.date + "T00:00:00").getDay()]}
                  </Text>
                ))}
              </View>
            ) : (
              <Txt v="cap" style={{ marginTop: 8 }}>
                Belum ada catatan. Selesai masak, lalu tekan "Catat pengeluaran".
              </Txt>
            )}
          </Card>

          <View style={row}>
            {(stats?.badges ?? []).map(b => (
              <Card
                key={b.key}
                aria-label={`${b.label}: ${b.earned ? "didapat" : b.hint}`}
                style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", columnGap: 4, opacity: b.earned ? 1 : 0.5 }}
              >
                <Icon name={b.icon as IconName} size={38} fill color={b.earned ? c.sec : c.mut} />
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: c.ink, textAlign: "center" }}>{b.label}</Text>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: c.mut, textAlign: "center", width: "100%" }}>
                  {b.earned ? "Didapat!" : b.hint}
                </Text>
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
          {guest ? (
            <Pressable
              role="link"
              onPress={() => router.push("/auth?mode=daftar")}
              style={{ minHeight: 54, justifyContent: "center", borderTopWidth: 1, borderTopColor: c.bd }}
            >
              <Txt b color={c.chili}>
                Daftar akun
              </Txt>
            </Pressable>
          ) : null}
          <Pressable
            role="button"
            onPress={async () => {
              await logout();
              router.dismissTo("/");
            }}
            style={{ minHeight: 54, justifyContent: "center", borderTopWidth: 1, borderTopColor: c.bd }}
          >
            <Txt b color={c.danger}>
              {guest ? "Keluar dari mode tamu" : "Logout"}
            </Txt>
          </Pressable>
        </Card>
      </Two>
    </Screen>
  );
}
