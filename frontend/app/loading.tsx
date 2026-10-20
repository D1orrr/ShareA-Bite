import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Mascot } from "../components/art";
import { Bar, Btn, Card, Check, Col, Row, Screen, Sticky, Txt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { R } from "../lib/format";

/** Delays (ms) at which each checklist step completes, then we show results. */
const DELAYS = [750, 1050, 1150];

export default function Loading() {
  const router = useRouter();
  const { budget } = useApp();
  const [done, setDone] = useState(0);
  const steps = ["Cek harga pasar Depok", "Pilih bahan sesuai alat masak", `Hitung struk, pastikan ${R(budget)} cukup`];

  useEffect(() => {
    // TODO: replace this simulated progress with the real /api/recipes/generate call.
    if (done < 3) {
      const id = setTimeout(() => setDone((d) => d + 1), DELAYS[done]);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => router.replace("/results"), 350);
    return () => clearTimeout(id);
  }, [done, router]);

  return (
    <Screen focus>
      <Col gap={18} style={{ alignItems: "center", maxWidth: 480, width: "100%", alignSelf: "center", marginTop: 32 }}>
        <Mascot size={190} mood="cook" />
        <Txt v="h1" center accessibilityRole="header">
          Lagi masak ide buat kamu...
        </Txt>
        <Card style={{ width: "100%" }}>
          <Col gap={12}>
            {steps.map((s, i) => (
              <Row key={i} style={{ opacity: i < done ? 1 : 0.4 }}>
                <Check on={i < done} />
                <Txt style={{ flex: 1 }}>{s}</Txt>
              </Row>
            ))}
          </Col>
          <Bar pct={done >= 3 ? 100 : 4 + done * 32} style={{ marginTop: 16 }} />
        </Card>
        <Sticky style={{ width: "100%" }}>Tips: telur dadar plus nasi hangat itu kombo paling aman buat akhir bulan.</Sticky>
        <Btn size="s" ghost title="Batal" onPress={() => router.replace("/home")} />
      </Col>
    </Screen>
  );
}
