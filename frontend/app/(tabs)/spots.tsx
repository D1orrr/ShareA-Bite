import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { SpotCard } from "../../components/blocks";
import { Card, Chips, Col, Icon, IconBtn, Row, Screen, Two, Txt } from "../../components/ui";
import { SPOTS } from "../../data/seed";
import { useT } from "../../theme";

const FILTERS = ["Nasi", "Sayur", "Protein", "Buka sekarang"];

export default function Spots() {
  const router = useRouter();
  const t = useT();
  const [on, setOn] = useState<string[]>(["Buka sekarang"]);
  const toggle = (x: string) => setOn((l) => (l.includes(x) ? l.filter((y) => y !== x) : [...l, x]));
  const list = SPOTS.filter((s) => on.every((f) => s.tags.includes(f)));
  const back = () => (router.canGoBack() ? router.back() : router.replace("/belanja"));

  return (
    <Screen>
      <Row>
        <IconBtn n="back" label="Kembali" bg="card" c="ink" size={48} onPress={back} />
      </Row>
      <View style={{ marginVertical: 16 }}>
        <Chips items={FILTERS} isOn={(x) => on.includes(x)} onToggle={toggle} />
      </View>
      <Two r>
        {/* Placeholder map — swap for react-native-maps / Google Maps embed later */}
        <View
          accessibilityLabel="Peta tempat murah"
          style={{ height: 360, borderRadius: 12, overflow: "hidden", backgroundColor: t.sirup, boxShadow: `0 1px 3px ${t.sh}` }}
        >
          <View style={{ position: "absolute", top: 0, bottom: 0, left: "46%", width: "4%", backgroundColor: "rgba(255,255,255,0.6)" }} />
          <View style={{ position: "absolute", left: 0, right: 0, top: "38%", height: "4%", backgroundColor: "rgba(255,255,255,0.6)" }} />
          {SPOTS.map((s, i) => (
            <View key={s.name} style={{ position: "absolute", left: `${22 + i * 22}%`, top: `${28 + (i % 2) * 34}%` }}>
              <Icon n="location" size={42} c={list.includes(s) ? "chili" : "#999999"} />
            </View>
          ))}
          <View
            style={{ position: "absolute", left: "44%", top: "50%", width: 18, height: 18, borderRadius: 9, backgroundColor: "#2563EB", borderWidth: 3, borderColor: "#fff" }}
          />
        </View>
        <Col>
          {list.length ? (
            list.map((s) => <SpotCard key={s.name} s={s} />)
          ) : (
            <Card>
              <Txt v="cap">Belum ada tempat yang cocok. Kurangi filter.</Txt>
            </Card>
          )}
        </Col>
      </Two>
    </Screen>
  );
}
