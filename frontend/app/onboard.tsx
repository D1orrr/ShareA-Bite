import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Mascot } from "../components/art";
import { useLayout, useTheme } from "../components/theme";
import { Txt } from "../components/Txt";
import { Bar, Btn, Card, Chip, Inp, Pxl, row, Screen, usePxlSize, wrap } from "../components/ui";
import { rp } from "../constants/theme";
import { useStore } from "../context/AppStore";

const TITLES = ["Budget kamu", "Makan apa aja", "Alat dan kampus"];
const WEEKLY = [70000, 105000, 175000];

export default function Onboard() {
  const { c } = useTheme();
  const { w } = useLayout();
  const { budget, setWeekly, pick, togglePick } = useStore();
  const [step, setStep] = useState(1);

  const weekly = rp(budget * 7);
  // Card inner width: page column (max 620) minus the card padding.
  const size = usePxlSize(weekly, Math.min(620, w - 32) - 32, 54);

  const chips = (list: string[]) => (
    <View style={[row, wrap]}>
      {list.map(x => (
        <Chip key={x} kind="checkbox" label={x} on={pick.includes(x)} onPress={() => togglePick(x)} />
      ))}
    </View>
  );

  return (
    <Screen focus>
      <View style={{ maxWidth: 620, width: "100%", alignSelf: "center", gap: 14 }}>
        <View style={row}>
          <Bar pct={step * 33.4} color={c.chili} label={`Langkah ${step} dari 3`} style={{ flex: 1 }} />
          <Txt v="cap" m>
            {step}/3
          </Txt>
        </View>
        <Txt v="h1" style={{ marginTop: 14 }}>
          {TITLES[step - 1]}
        </Txt>

        {step === 1 ? (
          <>
            <Txt v="cap" style={{ fontSize: 16, lineHeight: 25 }}>
              Bisa diubah kapan saja di Akun.
            </Txt>
            <Card>
              <Txt v="cap">Budget mingguan</Txt>
              <Pxl size={size} style={{ marginTop: 6, marginBottom: 12 }}>
                {weekly}
              </Pxl>
              <View style={[row, wrap]}>
                {WEEKLY.map(b => (
                  <Chip key={b} kind="radio" label={rp(b)} on={budget * 7 === b} onPress={() => setWeekly(b)} />
                ))}
              </View>
            </Card>
            <Txt v="cap" style={{ marginVertical: 13 }}>
              Default harian: {rp(budget)}
            </Txt>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Txt v="h3">Diet</Txt>
            {chips(["Halal", "Vegetarian", "High protein"])}
            <Inp placeholder="Alergi, contoh: udang, kacang tanah" aria-label="Alergi" />
            <Txt v="h3">Rasa favorit</Txt>
            {chips(["Pedas", "Manis", "Gurih", "Asin"])}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Txt v="h3">Alat masak</Txt>
            {chips(["Rice cooker", "Kompor", "Microwave"])}
            <Txt v="h3">Kampus dan kota</Txt>
            <Inp defaultValue="Universitas Indonesia, Depok" aria-label="Kampus" />
            <Card style={[row, { gap: 12 }]}>
              <Mascot size={54} />
              <Txt v="cap" style={{ flexShrink: 1 }}>
                Lengkap! Sisanya bisa nanti.
              </Txt>
            </Card>
          </>
        ) : null}

        <View style={[row, { marginTop: 12 }]}>
          <Btn ghost grow title="Lewati" onPress={() => router.dismissTo("/home")} />
          <Btn
            grow
            title={step < 3 ? "Lanjut" : "Mulai hemat"}
            onPress={() => (step < 3 ? setStep(step + 1) : router.dismissTo("/home"))}
          />
        </View>
      </View>
    </Screen>
  );
}
