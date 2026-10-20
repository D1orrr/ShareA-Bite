import React from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Bar, Btn, Card, Check, Col, FitPxl, Hero, Row, Screen, Two, Txt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { CATEGORIES, SHOP_BUDGET } from "../../data/seed";
import { budgetStatus, R } from "../../lib/format";
import { C } from "../../theme";

export default function Belanja() {
  const router = useRouter();
  const { cart, toggleCartItem } = useApp();
  const total = cart.reduce((a, x) => a + x.price, 0);
  const st = budgetStatus(total, SHOP_BUDGET);
  const over = total > SHOP_BUDGET;

  return (
    <Screen>
      <Two r>
        <Col>
          {CATEGORIES.map((g) => {
            const items = cart.map((x, i) => [x, i] as const).filter(([x]) => x.cat === g);
            if (!items.length) return null;
            return (
              <View key={g} style={{ gap: 14 }}>
                <Txt v="h3" style={{ marginTop: 6 }}>
                  {g}
                </Txt>
                <Card style={{ paddingVertical: 6, gap: 2 }}>
                  {items.map(([x, i]) => (
                    <Pressable
                      key={x.name + x.unit}
                      onPress={() => toggleCartItem(i)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: x.done }}
                      style={{ minHeight: 54, flexDirection: "row", alignItems: "center", gap: 10, opacity: x.done ? 0.45 : 1 }}
                    >
                      <Check on={x.done} />
                      <Txt strike={x.done} style={{ flex: 1 }}>
                        {x.name}{" "}
                        <Txt v="cap" num>
                          {x.qty} {x.unit}
                        </Txt>
                      </Txt>
                      <Txt f="jk7" num strike={x.done}>
                        {R(x.price)}
                      </Txt>
                    </Pressable>
                  ))}
                </Card>
              </View>
            );
          })}
        </Col>

        <Hero light>
          <Row sp>
            <Txt v="cap">Estimasi total</Txt>
            <Txt v="cap" num>
              dari {R(SHOP_BUDGET)}
            </Txt>
          </Row>
          <FitPxl c="ink" style={{ marginTop: 6, marginBottom: 12 }}>
            {R(total)}
          </FitPxl>
          <Bar pct={(total / SHOP_BUDGET) * 100} color={st.color} />
          <Txt f="vn7" c={over ? "err" : "daun"} style={{ marginTop: 10, marginBottom: 16 }}>
            {over ? `Lewat ${R(total - SHOP_BUDGET)}` : `Sisa ${R(SHOP_BUDGET - total)}. Masih cukup nih.`} · {st.label}
          </Txt>
          <Btn full icon="pin" title="Cari tempat murah" onPress={() => router.push("/spots")} />
        </Hero>
      </Two>
    </Screen>
  );
}
