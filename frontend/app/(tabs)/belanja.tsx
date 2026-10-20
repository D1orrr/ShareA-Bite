import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../components/theme";
import { Txt } from "../../components/Txt";
import { Bar, between, Btn, Check, Hero, Pxl, row, Screen, Two, usePxlSize } from "../../components/ui";
import { CART_GROUPS } from "../../constants/data";
import { budgetStatus, font, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

export default function Belanja() {
  const { c } = useTheme();
  const { cart, toggleCart, shopB } = useStore();
  const total = cart.reduce((sum, x) => sum + x.price, 0);

  return (
    <Screen>
      <Two r>
        <View style={{ gap: 14 }}>
          {CART_GROUPS.map(group => {
            const items = cart.map((x, i) => ({ x, i })).filter(({ x }) => x.cat === group);
            if (!items.length) return null;
            return (
              <View key={group} style={{ gap: 14 }}>
                <Txt v="h3" style={{ marginTop: 6 }}>
                  {group}
                </Txt>
                <View
                  style={{
                    backgroundColor: c.card,
                    borderRadius: 12,
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                    gap: 2,
                    boxShadow: `0 1px 3px ${c.sh}`,
                  }}
                >
                  {items.map(({ x, i }) => {
                    const strike = x.done
                      ? ({ textDecorationLine: "line-through" } as const)
                      : null;
                    return (
                      <Pressable
                        key={x.name + x.unit}
                        role="checkbox"
                        aria-checked={x.done}
                        aria-label={`${x.name} ${x.qty} ${x.unit}, ${rp(x.price)}`}
                        onPress={() => toggleCart(i)}
                        style={[row, { minHeight: 54, opacity: x.done ? 0.45 : 1 }]}
                      >
                        <Check on={x.done} />
                        <Txt style={[{ flex: 1 }, strike]}>
                          {x.name}{" "}
                          <Text style={{ fontFamily: font.headMedium, fontSize: 13, color: c.mut, fontVariant: ["tabular-nums"] }}>
                            {x.qty} {x.unit}
                          </Text>
                        </Txt>
                        <Txt b m style={strike}>
                          {rp(x.price)}
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        <Hero lt>
          <Summary total={total} budget={shopB} />
        </Hero>
      </Two>
    </Screen>
  );
}

// Split out so useTheme() returns the panel's colors.
function Summary({ total, budget }: { total: number; budget: number }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const [color, label] = budgetStatus(total, budget, c);
  const over = total > budget;
  const size = usePxlSize(rp(total), w);
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      <View style={[row, between]}>
        <Txt v="cap">Estimasi total</Txt>
        <Txt v="cap" m>
          dari {rp(budget)}
        </Txt>
      </View>
      <Pxl size={size} color={c.ink} style={{ marginTop: 6, marginBottom: 12 }}>
        {rp(total)}
      </Pxl>
      <Bar pct={Math.min(100, (total / budget) * 100)} color={color} label="Estimasi dari budget belanja" />
      <Txt b color={over ? c.danger : c.daun} style={{ marginTop: 10, marginBottom: 16 }}>
        {over ? `Lewat ${rp(total - budget)}` : `Sisa ${rp(budget - total)}. Masih cukup nih.`} {label}
      </Txt>
      <Btn full icon="pin_drop" title="Cari tempat murah" onPress={() => router.push("/spots")} />
    </View>
  );
}
