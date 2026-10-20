import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, router } from "expo-router";
import Slider from "@react-native-community/slider";
import { FoodPhoto, Mascot } from "../../components/art";
import { useToast } from "../../components/Overlay";
import { useCountUp, useLayout, useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import {
  Avatar,
  between,
  Btn,
  Card,
  Chip,
  Hero,
  HScroll,
  Pxl,
  row,
  Screen,
  Stamp,
  Sticky,
  Two,
  usePxlSize,
  wrap,
} from "../../components/ui";
import { RECIPES, recipeCost } from "../../constants/data";
import { budgetStatus, font, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

// Hard-coded in the design.
const SPENT_TODAY = 9500;

export default function Home() {
  const { c } = useTheme();
  const { wide } = useLayout();
  const toast = useToast();
  const { budget, setBudget, guest, pick, togglePick } = useStore();
  const shown = useCountUp(budget);
  const [rowW, setRowW] = useState(0);

  const amount = rp(shown);
  // Room for the number between the two 48px buttons and the 14px gaps.
  const size = usePxlSize(rp(budget), rowW - 2 * 48 - 2 * 14);

  return (
    <Screen>
      <View style={[row, between, { marginBottom: 18 }]}>
        <View>
          <Txt v="cap">Selamat pagi{guest ? ", tamu" : ""}</Txt>
          <Txt v="h1">Halo, {guest ? "Kawan" : "Dinda"}</Txt>
        </View>
        <Avatar label={guest ? "?" : "D"} />
      </View>

      <Two r>
        <Hero style={{ gap: 16 }}>
          <HeroBody
            budget={budget}
            amount={amount}
            size={size}
            onRow={setRowW}
            setBudget={setBudget}
            pick={pick}
            togglePick={togglePick}
            onCustom={() => toast("Geser slider untuk budget custom")}
          />
        </Hero>
        <View style={{ gap: 14 }}>
          <Sticky>
            <B>Tip hari ini</B>
            {"\n"}Beli bumbu per ons, bukan per bungkus. Dompet aman sampai akhir bulan.
          </Sticky>
          <Card style={[row, { gap: 14 }]}>
            <Mascot size={76} />
            <View style={{ flexShrink: 1 }}>
              <Txt v="h3">Si Mangkok siap masak</Txt>
              <Txt v="cap">Tekan Generate, 3 resep muncul dalam hitungan detik.</Txt>
            </View>
          </Card>
        </View>
      </Two>

      <View style={[row, between, { marginTop: 30, marginBottom: 8 }]}>
        <Txt v="h2" style={{ flexShrink: 1 }}>
          Pilihan Hemat Hari Ini
        </Txt>
        <Link
          href="/simpan"
          style={{ flexShrink: 0, fontFamily: font.bodyBold, fontSize: 13, color: c.mut, textDecorationLine: "underline" }}
        >
          Lihat semua
        </Link>
      </View>
      <HScroll snap={222}>
        {RECIPES.map(r => (
          <Link key={r.id} href={`/recipe/${r.id}`} asChild>
            <Pressable role="link" aria-label={r.title}>
              <Card style={[{ padding: 10 }, wide ? { minWidth: 210 } : { width: 210 }]}>
                <FoodPhoto art={r.id} color={r.color} height={110} />
                <Txt v="h3" style={{ fontSize: 16, marginTop: 10, marginBottom: 4 }}>
                  {r.title}
                </Txt>
                <Txt b m color={c.chili}>
                  {rp(recipeCost(r))}
                </Txt>
              </Card>
            </Pressable>
          </Link>
        ))}
      </HScroll>
    </Screen>
  );
}

// Split out so useTheme() returns the panel's colors.
function HeroBody({
  budget,
  amount,
  size,
  onRow,
  setBudget,
  pick,
  togglePick,
  onCustom,
}: {
  budget: number;
  amount: string;
  size: number;
  onRow: (w: number) => void;
  setBudget: (b: number) => void;
  pick: string[];
  togglePick: (v: string) => void;
  onCustom: () => void;
}) {
  const { c } = useTheme();
  const [statusColor, statusLabel] = budgetStatus(SPENT_TODAY, budget, c);
  return (
    <>
      <View style={[row, between, wrap]}>
        <Txt v="cap" b color={c.ink}>
          Budget makan hari ini
        </Txt>
        <Stamp label={statusLabel.toUpperCase()} color={statusColor} />
      </View>
      <View style={[row, { gap: 14 }]} onLayout={e => onRow(e.nativeEvent.layout.width)}>
        <Btn ghost size="s" label="Kurangi" style={{ minWidth: 48, paddingHorizontal: 0 }} title="−" onPress={() => setBudget(budget - 1000)} />
        <Pxl size={size}>{amount}</Pxl>
        <Btn ghost size="s" label="Tambah" style={{ minWidth: 48, paddingHorizontal: 0 }} title="+" onPress={() => setBudget(budget + 1000)} />
      </View>
      <Slider
        accessibilityLabel="Budget"
        minimumValue={5000}
        maximumValue={50000}
        step={1000}
        value={budget}
        onValueChange={setBudget}
        minimumTrackTintColor={c.kunyit}
        maximumTrackTintColor="rgba(19,27,46,0.75)"
        thumbTintColor={c.kunyit}
        style={{ width: "100%", height: 34 }}
      />
      <View style={[row, wrap]}>
        {[10000, 15000, 25000].map(b => (
          <Chip key={b} kind="radio" label={rp(b)} on={budget === b} onPress={() => setBudget(b)} />
        ))}
        <Chip label="Custom" onPress={onCustom} />
      </View>
      <View style={[row, wrap]}>
        {["High protein", "Pedas", "Maks 20 mnt", "1 porsi", "Bahan ada"].map(x => (
          <Chip key={x} kind="checkbox" label={x} on={pick.includes(x)} onPress={() => togglePick(x)} />
        ))}
      </View>
      <Btn size="xl" full icon="auto_awesome" title="Generate Recipe" onPress={() => router.push("/loading")} />
    </>
  );
}
