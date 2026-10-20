import React from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { FoodPhoto } from "../../../components/art";
import { useSaveRecipe } from "../../../components/cards";
import { Icon } from "../../../components/Icon";
import { goBack } from "../../../components/nav";
import { useToast } from "../../../components/Overlay";
import { useLayout, useTheme } from "../../../components/theme";
import { Txt } from "../../../components/Txt";
import {
  Avatar,
  Bar,
  Barcode,
  between,
  Btn,
  Card,
  Chip,
  LineRow,
  Pill,
  Ring,
  RoundBtn,
  row,
  Rule,
  Screen,
  Stamp,
  Sticky,
  Two,
  wrap,
} from "../../../components/ui";
import { formatTimer, RECIPES, recipeById, recipeCost } from "../../../constants/data";
import { clamp, rp } from "../../../constants/theme";
import { RecipeTab, useStore } from "../../../context/AppStore";

// One pre-built page per recipe, so direct links work in the web export.
export async function generateStaticParams() {
  return RECIPES.map(r => ({ id: String(r.id) }));
}

export default function RecipeDetail() {
  const { c } = useTheme();
  const { w } = useLayout();
  const toast = useToast();
  const save = useSaveRecipe();
  const { budget, saved, tabD, setTabD, addToCart } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = recipeById(Number(id));
  const cost = recipeCost(r);
  const ok = cost <= budget;
  const isSaved = saved.includes(r.id);

  const nutrition: [string, string, number][] = [
    ["Kalori", `${r.cal} kkal`, r.cal / 8],
    ["Protein", `${r.pro} g`, r.pro * 2.4],
    ["Karbo", `${r.carb} g`, r.carb],
  ];

  return (
    <Screen>
      <Two>
        <View style={{ gap: 14 }}>
          <View>
            <FoodPhoto art={r.id} color={r.color} height={clamp(220, 0.34 * w, 380)} />
            <View style={[row, between, { position: "absolute", top: 14, left: 14, right: 14 }]}>
              <RoundBtn icon="arrow_back" label="Kembali" onPress={goBack} />
              <RoundBtn
                icon="favorite"
                label={isSaved ? "Hapus dari Simpan" : "Simpan"}
                fill={isSaved}
                color={c.chili}
                onPress={() => save(r.id)}
              />
            </View>
          </View>
          <Txt v="h1">{r.title}</Txt>
          <View style={[row, wrap]}>
            <View style={[row, { gap: 4 }]}>
              <Icon name="schedule" color={c.mut} />
              <Txt v="cap" m>
                {r.min} mnt
              </Txt>
            </View>
            <Txt v="cap" m>
              1 porsi
            </Txt>
            <Stamp bad={!ok} label={ok ? "UNDER BUDGET" : "LEWAT BUDGET"} />
          </View>
          {nutrition.map(([label, value, pct]) => (
            <View key={label}>
              <View style={[row, between]}>
                <Txt v="cap" m>
                  {label}
                </Txt>
                <Txt v="cap" m>
                  {value}
                </Txt>
              </View>
              <Bar pct={Math.min(100, pct)} color={c.daun} height={8} />
            </View>
          ))}
        </View>

        <View style={{ gap: 14 }}>
          <Pill<RecipeTab>
            options={[
              { value: "Detail", label: "Struk" },
              { value: "Langkah", label: "Langkah" },
              { value: "Nutrisi", label: "Nutrisi" },
            ]}
            value={tabD}
            onChange={setTabD}
          />

          {tabD === "Detail" ? (
            <Card torn style={{ gap: 6, padding: 20 }}>
              <View style={[row, between]}>
                <Txt v="cap" b m>
                  STRUK ANAK KOS
                </Txt>
                <Txt v="cap" m>
                  No. 04{r.id}8
                </Txt>
              </View>
              {r.ing.map(x => (
                <View key={x.name}>
                  <LineRow label={`${x.name} ${x.qty} ${x.unit}`} value={rp(x.price)} />
                  {x.swap ? <Chip
                      sw
                      label={`Cheaper swap: ${x.swap}`}
                      onPress={() => toast(`Swap: ${x.swap}`)}
                      style={{ alignSelf: "flex-start" }}
                    /> : null}
                </View>
              ))}
              <Rule dashed color={c.mut} style={{ marginTop: 6 }} />
              <View style={[row, between, { paddingTop: 4 }]}>
                <Txt v="h2">TOTAL</Txt>
                <Txt b m color={c.chili} style={{ fontSize: 28, lineHeight: 34 }}>
                  {rp(cost)}
                </Txt>
              </View>
              <Txt v="cap" b color={ok ? c.daun : c.danger}>
                {ok ? `Sisa ${rp(budget - cost)}. Dompet aman.` : `Lewat ${rp(cost - budget)} dari budget.`}
              </Txt>
              <Barcode />
            </Card>
          ) : null}

          {tabD === "Langkah" ? (
            <>
              {r.steps.map((s, i) => (
                <Card key={i} style={[row, { alignItems: "flex-start" }]}>
                  <Avatar label={String(i + 1)} bg={c.chili} fg={c.onp} />
                  <View style={{ flex: 1 }}>
                    <Txt>{s.text}</Txt>
                    {s.sec ? (
                      <Txt v="cap" m>
                        Timer {formatTimer(s.sec)}
                      </Txt>
                    ) : null}
                  </View>
                </Card>
              ))}
              <Sticky>{r.tip}</Sticky>
            </>
          ) : null}

          {tabD === "Nutrisi" ? (
            <Card style={[row, { gap: 20 }]}>
              <Ring p={r.score} size={90} inner={70} fontSize={22} />
              <View style={{ flexShrink: 1 }}>
                <Txt v="h2">Skor nutrisi</Txt>
                <Txt v="cap">
                  {r.cal} kkal, {r.pro} g protein, {r.carb} g karbo. Seimbang untuk satu kali makan.
                </Txt>
              </View>
            </Card>
          ) : null}

          <View style={[row, wrap, { marginTop: 6 }]}>
            <Btn
              ghost
              grow
              icon="shopping_bag"
              title="Ke Belanjaan"
              onPress={() => {
                addToCart(r);
                toast("Bahan masuk ke Belanja");
              }}
            />
            <Btn grow title="Mulai Masak" onPress={() => router.push(`/cook/${r.id}`)} />
          </View>
        </View>
      </Two>
    </Screen>
  );
}

