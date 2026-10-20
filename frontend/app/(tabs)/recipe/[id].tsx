import React, { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FoodPlate } from "../../../components/art";
import {
  Avatar,
  Bar,
  Barcode,
  Btn,
  Card,
  Chip,
  Col,
  Dashed,
  Icon,
  IconBtn,
  Line,
  Ring,
  Row,
  Screen,
  Segmented,
  Stamp,
  Sticky,
  Two,
  Txt,
} from "../../../components/ui";
import { useApp } from "../../../context/AppContext";
import { getRecipe, RECIPES } from "../../../data/seed";
import { cost, mmss, R } from "../../../lib/format";
import { C, clamp, useLayout } from "../../../theme";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ id: String(r.id) }));
}

const TABS = ["Struk", "Langkah", "Nutrisi"] as const;
type Tab = (typeof TABS)[number];

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useLayout();
  const { budget, saved, toggleSaved, addRecipeToCart, toast } = useApp();
  const [tab, setTab] = useState<Tab>("Struk");
  const r = getRecipe(id);
  const c = cost(r);
  const ok = c <= budget;
  const back = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  const nutrition: [string, string, number][] = [
    ["Kalori", `${r.kcal} kkal`, r.kcal / 8],
    ["Protein", `${r.protein} g`, r.protein * 2.4],
    ["Karbo", `${r.carbs} g`, r.carbs],
  ];

  return (
    <Screen>
      <Two>
        <Col>
          <View>
            <FoodPlate dish={r.id} color={r.color} height={clamp(220, width * 0.34, 380)} />
            <Row sp style={{ position: "absolute", top: 14, left: 14, right: 14 }}>
              <IconBtn n="back" label="Kembali" bg="card" c="ink" size={48} onPress={back} />
              <IconBtn n="heart" fill={saved.includes(r.id)} label="Simpan" bg="card" c="chili" size={48} onPress={() => toggleSaved(r.id)} />
            </Row>
          </View>
          <Txt v="h1" accessibilityRole="header">
            {r.title}
          </Txt>
          <Row wrap>
            <Row gap={4}>
              <Icon n="clock" c="mut" />
              <Txt v="cap" num>
                {r.minutes} mnt
              </Txt>
            </Row>
            <Txt v="cap">1 porsi</Txt>
            <Stamp label={ok ? "UNDER BUDGET" : "LEWAT BUDGET"} bad={!ok} />
          </Row>
          {nutrition.map(([k, v, p]) => (
            <View key={k}>
              <Row sp>
                <Txt v="cap">{k}</Txt>
                <Txt v="cap" num>
                  {v}
                </Txt>
              </Row>
              <Bar pct={Math.min(100, p)} color="daun" h={8} />
            </View>
          ))}
        </Col>

        <Col>
          <Segmented items={TABS} value={tab} onChange={setTab} />

          {tab === "Struk" ? (
            <Card torn style={{ padding: 20 }}>
              <Col gap={6}>
                <Row sp>
                  <Txt v="cap" f="vn7">
                    STRUK ANAK KOS
                  </Txt>
                  <Txt v="cap" num>
                    No. 04{r.id}8
                  </Txt>
                </Row>
                {r.ingredients.map((x) => (
                  <View key={x.name}>
                    <Line left={`${x.name} ${x.qty} ${x.unit}`} right={R(x.price)} />
                    {x.swap ? <Chip sw label={`Cheaper swap: ${x.swap}`} onPress={() => toast(`Swap: ${x.swap}`)} /> : null}
                  </View>
                ))}
                <Dashed style={{ marginTop: 6 }} />
                <Row sp style={{ paddingTop: 4 }}>
                  <Txt v="h2">TOTAL</Txt>
                  <Txt f="jk7" s={28} c="chili" num>
                    {R(c)}
                  </Txt>
                </Row>
                <Txt v="cap" f="vn7" c={ok ? "daun" : "err"}>
                  {ok ? `Sisa ${R(budget - c)}. Dompet aman.` : `Lewat ${R(c - budget)} dari budget.`}
                </Txt>
                <Barcode />
              </Col>
            </Card>
          ) : null}

          {tab === "Langkah" ? (
            <>
              {r.steps.map((s, i) => (
                <Card key={i}>
                  <Row align="flex-start">
                    <Avatar letter={String(i + 1)} bg={C.heroFrom} fg="#fff" />
                    <View style={{ flex: 1 }}>
                      <Txt>{s.text}</Txt>
                      {s.seconds ? (
                        <Txt v="cap" num>
                          Timer {mmss(s.seconds)}
                        </Txt>
                      ) : null}
                    </View>
                  </Row>
                </Card>
              ))}
              <Sticky>{r.tip}</Sticky>
            </>
          ) : null}

          {tab === "Nutrisi" ? (
            <Card>
              <Row gap={20}>
                <Ring p={r.score} size={90} stroke={10} fs={22} />
                <View style={{ flex: 1 }}>
                  <Txt v="h2">Skor nutrisi</Txt>
                  <Txt v="cap">
                    {r.kcal} kkal, {r.protein} g protein, {r.carbs} g karbo. Seimbang untuk satu kali makan.
                  </Txt>
                </View>
              </Row>
            </Card>
          ) : null}

          <Row wrap style={{ marginTop: 6 }}>
            <Btn grow ghost icon="cart" title="Ke Belanjaan" onPress={() => addRecipeToCart(r)} />
            <Btn grow title="Mulai Masak" onPress={() => router.push(`/cook/${r.id}`)} />
          </Row>
        </Col>
      </Two>
    </Screen>
  );
}
