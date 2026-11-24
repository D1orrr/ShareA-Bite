import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Icon } from "../../components/Icon";
import { useLayout, useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import { Bar, between, Btn, Card, row, RoundBtn, Screen, Stamp, wrap } from "../../components/ui";
import { rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";
import type { Meter, Tier } from "../../lib/api";

const ORDER: Tier[] = ["free", "canteen", "brunch", "gala"];

function MeterRow({ label, m }: { label: string; m: Meter }) {
  const { c } = useTheme();
  const pct = m.limit ? Math.min(100, (m.used / m.limit) * 100) : 0;
  return (
    <View style={{ gap: 4 }}>
      <View style={[row, between]}>
        <Txt v="cap">{label}</Txt>
        <Txt b style={{ fontSize: 13 }}>
          {m.limit === null ? `${m.used} · tanpa batas` : `${m.used} / ${m.limit}`}
        </Txt>
      </View>
      {m.limit !== null ? <Bar pct={pct} color={pct >= 100 ? c.chili : c.daun} height={8} label={label} /> : null}
    </View>
  );
}

/** Subscription tiers (demo mode: switching does not charge anything yet). */
export default function Paket() {
  const { c } = useTheme();
  const { wide } = useLayout();
  const { plans, myPlan, refreshPlan, choosePlan, guest, mode } = useStore();
  const [busy, setBusy] = useState<Tier | null>(null);

  useEffect(() => {
    refreshPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = myPlan?.tier ?? "free";
  const list = ORDER.map(k => plans.find(p => p.key === k)).filter(Boolean);

  const pick = async (t: Tier) => {
    if (guest && t !== "free") {
      router.push("/auth");
      return;
    }
    setBusy(t);
    await choosePlan(t);
    setBusy(null);
  };

  return (
    <Screen>
      <View style={[row, { marginBottom: 12 }]}>
        <RoundBtn icon="arrow_back" label="Kembali" onPress={() => (router.canGoBack() ? router.back() : router.replace("/akun"))} />
      </View>
      <Txt v="h1">Pilih paket kamu</Txt>
      <Txt v="cap" style={{ marginBottom: 16 }}>
        Mode demo: ganti paket belum memotong pembayaran apa pun.
      </Txt>

      {mode === "offline" ? (
        <Card>
          <Txt v="cap">Paket hanya tersedia saat server online.</Txt>
        </Card>
      ) : null}

      {myPlan ? (
        <Card style={{ gap: 10, marginBottom: 16 }}>
          <View style={[row, between]}>
            <Txt b>Pemakaian hari ini · {myPlan.plan.name}</Txt>
            {myPlan.until ? <Txt v="cap">aktif s.d. {new Date(myPlan.until).toLocaleDateString("id-ID")}</Txt> : null}
          </View>
          <MeterRow label="Generate resep (hari ini)" m={myPlan.usage.generate} />
          <MeterRow label="Swap bahan hemat (hari ini)" m={myPlan.usage.swap} />
          <MeterRow label="Resep tersimpan" m={myPlan.usage.saved} />
          <MeterRow label="Posting komunitas (7 hari)" m={myPlan.usage.posts_week} />
        </Card>
      ) : null}

      <View style={[wide ? [row, wrap] : null, { gap: 14, alignItems: "stretch" }]}>
        {list.map(p => {
          const on = p!.key === current;
          const hot = p!.key === "brunch";
          return (
            <Card
              key={p!.key}
              style={{
                flex: wide ? 1 : undefined,
                minWidth: wide ? 220 : undefined,
                gap: 10,
                borderWidth: on || hot ? 2 : 0,
                borderColor: on ? c.daun : c.kunyit,
              }}
            >
              <View style={[row, between, wrap]}>
                <Txt v="h3">{p!.name}</Txt>
                {on ? <Stamp label="PAKET KAMU" bg={c.daun} color="#ffffff" /> : hot ? <Stamp label="PALING LAKU" bg={c.kunyit} color={c.ink} /> : null}
              </View>
              <Txt v="cap">{p!.tagline}</Txt>
              <Txt>
                <B>{p!.price ? rp(p!.price) : "Gratis"}</B>
                {p!.price ? <Txt v="cap"> / bulan</Txt> : null}
              </Txt>
              <View style={{ gap: 6 }}>
                {p!.perks.map(perk => (
                  <View key={perk} style={[row, { gap: 8, alignItems: "flex-start" }]}>
                    <Icon name="check" size={18} color={c.daun} />
                    <Txt style={{ flex: 1, fontSize: 14 }}>{perk}</Txt>
                  </View>
                ))}
              </View>
              <View style={{ flexGrow: 1 }} />
              <Btn
                ghost={on}
                title={on ? "Sedang dipakai" : busy === p!.key ? "Memproses..." : guest && p!.key !== "free" ? "Daftar untuk berlangganan" : `Pilih ${p!.name}`}
                onPress={on || busy ? undefined : () => pick(p!.key)}
              />
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
