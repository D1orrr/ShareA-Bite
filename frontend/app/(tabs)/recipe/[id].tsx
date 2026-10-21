import React, { useState } from "react";
import { Pressable } from "react-native";
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
import { formatTimer, recipeCost } from "../../../constants/data";
import { STATIC_RECIPE_IDS, useRecipe } from "../../../lib/useRecipe";
import { Splash } from "../../../components/Splash";
import { Mascot } from "../../../components/art";
import { alpha, clamp, rp } from "../../../constants/theme";
import { RecipeTab, useStore } from "../../../context/AppStore";

// One pre-built page per recipe, so direct links work in the web export.
export async function generateStaticParams() {
  return STATIC_RECIPE_IDS;
}

export default function RecipeDetail() {
  const { c } = useTheme();
  const { w } = useLayout();
  const toast = useToast();
  const save = useSaveRecipe();
  const { budget, saved, tabD, setTabD, addToCart, swapIngredient } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRecipe(id);
  const [swapping, setSwapping] = useState<number | null>(null);

  if (r === undefined) return <Splash />;
  if (r === null)
    return (
      <Screen>
        <View style={{ alignItems: "center", paddingVertical: 50, gap: 14 }}>
          <Mascot size={130} mood="err" />
          <Txt v="h2">Resep tidak ditemukan</Txt>
          <Btn title="Kembali ke Explore" onPress={() => router.navigate("/home")} />
        </View>
      </Screen>
    );

  const doSwap = async (index: number) => {
    const x = r.ing[index];
    if (!x.swapTo || swapping !== null) return;
    setSwapping(index);
    const v = await swapIngredient(r, index);
    setSwapping(null);
    if (v) {
      toast(`Diganti ke ${x.swapTo.to}, hemat ${rp(x.swapTo.saving)}`);
      router.replace(`/recipe/${v.id}`);
    }
  };

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
            <FoodPhoto art={r.art ?? r.id} color={r.color} height={clamp(220, 0.34 * w, 380)} />
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
            {r.parentId ? <Stamp label="VERSI HEMAT" color={c.sec} bg={alpha(c.sec, 0.14)} /> : null}
          </View>
          {r.parentId ? (
            <Pressable role="link" onPress={() => router.replace(`/recipe/${r.parentId}`)} style={{ alignSelf: "flex-start" }}>
              <Txt v="cap" b color={c.chili} style={{ textDecorationLine: "underline" }}>
                Lihat resep asli
              </Txt>
            </Pressable>
          ) : null}
          {r.tools?.length ? <Txt v="cap">Alat: {r.tools.join(" / ")}</Txt> : null}
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
                  No. {String(r.id).padStart(4, "0")}
                </Txt>
              </View>
              {r.ing.map((x, i) => (
                <View key={`${x.name}-${i}`}>
                  <LineRow label={`${x.name} ${+x.qty.toFixed(2)} ${x.unit}`} value={rp(x.price)} />
                  {x.swap ? (
                    <Chip
                      sw
                      label={swapping === i ? "Mengganti..." : `Cheaper swap: ${x.swap}`}
                      onPress={() => (x.swapTo ? doSwap(i) : toast(`Swap: ${x.swap}`))}
                      style={{ alignSelf: "flex-start" }}
                    />
                  ) : null}
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
              {r.pantryCost ? (
                <Txt v="cap">Sudah punya nasi/minyak/kecap di kos? Bayarnya cukup {rp(cost - r.pantryCost)}.</Txt>
              ) : null}
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
                  {r.cal} kkal, {r.pro} g protein, {r.carb} g karbo.{" "}
                  {r.score >= 80 ? "Seimbang untuk satu kali makan." : r.score >= 65 ? "Cukup, tambah sayur biar lebih seimbang." : "Kurang seimbang, tambah protein atau sayur."}
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
              onPress={() => addToCart(r)}
            />
            <Btn grow title="Mulai Masak" onPress={() => router.push(`/cook/${r.id}`)} />
          </View>
        </View>
      </Two>
    </Screen>
  );
}

