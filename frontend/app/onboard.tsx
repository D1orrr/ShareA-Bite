import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Mascot } from "../components/art";
import { Bar, Btn, Card, Chip, Chips, Col, FitPxl, Input, Row, Screen, Txt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { R } from "../lib/format";

const TITLES = ["Budget kamu", "Makan apa aja", "Alat dan kampus"];
const WEEKLY = [70000, 105000, 175000];

export default function Onboard() {
  const router = useRouter();
  const { budget, setBudget, prefs, togglePref } = useApp();
  const [step, setStep] = useState(1);
  const isOn = (x: string) => prefs.includes(x);
  const finish = () => router.replace("/home");

  return (
    <Screen focus>
      <Col style={{ maxWidth: 620, width: "100%", alignSelf: "center" }}>
        <Row>
          <View style={{ flex: 1 }}>
            <Bar pct={step * 33.4} />
          </View>
          <Txt v="cap" num>
            {step}/3
          </Txt>
        </Row>
        <Txt v="h1" style={{ marginTop: 14 }} accessibilityRole="header">
          {TITLES[step - 1]}
        </Txt>

        {step === 1 ? (
          <>
            <Txt v="cap" s={16}>
              Bisa diubah kapan saja di Akun.
            </Txt>
            <Card>
              <Txt v="cap">Budget mingguan</Txt>
              <FitPxl s={54} style={{ marginTop: 6, marginBottom: 12 }}>
                {R(budget * 7)}
              </FitPxl>
              <Row wrap>
                {WEEKLY.map((b) => (
                  <Chip key={b} label={R(b)} on={Math.round(budget * 7) === b} onPress={() => setBudget(b / 7)} />
                ))}
              </Row>
            </Card>
            <Txt v="cap">Default harian: {R(budget)}</Txt>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Txt v="h3">Diet</Txt>
            <Chips items={["Halal", "Vegetarian", "High protein"]} isOn={isOn} onToggle={togglePref} />
            <Input placeholder="Alergi, contoh: udang, kacang tanah" accessibilityLabel="Alergi" />
            <Txt v="h3">Rasa favorit</Txt>
            <Chips items={["Pedas", "Manis", "Gurih", "Asin"]} isOn={isOn} onToggle={togglePref} />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Txt v="h3">Alat masak</Txt>
            <Chips items={["Rice cooker", "Kompor", "Microwave"]} isOn={isOn} onToggle={togglePref} />
            <Txt v="h3">Kampus dan kota</Txt>
            <Input defaultValue="Universitas Indonesia, Depok" accessibilityLabel="Kampus" />
            <Card>
              <Row gap={12}>
                <Mascot size={54} />
                <Txt v="cap">Lengkap! Sisanya bisa nanti.</Txt>
              </Row>
            </Card>
          </>
        ) : null}

        <Row style={{ marginTop: 12 }}>
          <Btn grow ghost title="Lewati" onPress={finish} />
          <Btn grow title={step < 3 ? "Lanjut" : "Mulai hemat"} onPress={() => (step < 3 ? setStep(step + 1) : finish())} />
        </Row>
      </Col>
    </Screen>
  );
}
