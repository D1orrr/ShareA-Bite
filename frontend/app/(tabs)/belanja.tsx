import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../components/theme";
import { Txt } from "../../components/Txt";
import { Bar, between, Btn, Card, Check, Chip, Hero, Inp, Pxl, row, Screen, Two, usePxlSize, wrap } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { CART_GROUPS, Category } from "../../constants/data";
import { budgetStatus, font, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

export default function Belanja() {
  const { c } = useTheme();
  const { cart, toggleCart, removeCart, addCartItem, shopB } = useStore();
  const total = cart.reduce((sum, x) => sum + x.price, 0);

  // "Tambah bahan" form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cat, setCat] = useState<Category>("Sayuran");
  const add = async () => {
    if (!name.trim()) return;
    await addCartItem({ name: name.trim(), price: Number(price.replace(/\D/g, "")) || 0, category: cat });
    setName("");
    setPrice("");
  };

  return (
    <Screen>
      <Two r>
        <View style={{ gap: 14 }}>
          {cart.length === 0 ? (
            <Card>
              <Txt v="h3">Daftar belanja masih kosong</Txt>
              <Txt v="cap">Buka resep lalu tekan "Ke Belanjaan", atau tambah bahan di bawah.</Txt>
            </Card>
          ) : null}
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
                    const strike = x.done ? ({ textDecorationLine: "line-through" } as const) : null;
                    return (
                      <View key={(x.id ?? x.name) + x.unit} style={[row, { gap: 4 }]}>
                        <Pressable
                          role="checkbox"
                          aria-checked={x.done}
                          aria-label={`${x.name} ${x.qty} ${x.unit}, ${rp(x.price)}`}
                          onPress={() => toggleCart(i)}
                          style={[row, { flex: 1, minHeight: 54, opacity: x.done ? 0.45 : 1 }]}
                        >
                          <Check on={x.done} />
                          <Txt style={[{ flex: 1 }, strike]}>
                            {x.name}{" "}
                            <Text
                              style={{ fontFamily: font.headMedium, fontSize: 13, color: c.mut, fontVariant: ["tabular-nums"] }}
                            >
                              {+x.qty.toFixed(2)} {x.unit}
                            </Text>
                          </Txt>
                          <Txt b m style={strike}>
                            {rp(x.price)}
                          </Txt>
                        </Pressable>
                        <Pressable
                          role="button"
                          aria-label={`Hapus ${x.name}`}
                          onPress={() => removeCart(i)}
                          style={{ width: 36, height: 44, alignItems: "center", justifyContent: "center" }}
                        >
                          <Icon name="close" size={20} color={c.mut} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <Card style={{ gap: 10 }}>
            <Txt v="h3">Tambah bahan</Txt>
            <View style={row}>
              <Inp
                value={name}
                onChangeText={setName}
                placeholder="Nama bahan"
                aria-label="Nama bahan"
                onSubmitEditing={add}
                style={{ flex: 2, width: undefined }}
              />
              <Inp
                value={price}
                onChangeText={setPrice}
                placeholder="Harga"
                aria-label="Harga"
                inputMode="numeric"
                onSubmitEditing={add}
                style={{ flex: 1, width: undefined }}
              />
            </View>
            <View style={[row, wrap, { gap: 8 }]}>
              {CART_GROUPS.map(g => (
                <Chip key={g} kind="radio" label={g} on={cat === g} onPress={() => setCat(g)} />
              ))}
            </View>
            <Btn size="s" icon="add" title="Tambah" onPress={add} style={{ alignSelf: "flex-start" }} />
          </Card>
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
  const { cart, clearDone, setShopBudget } = useStore();
  const doneCount = cart.filter(x => x.done).length;
  const remaining = cart.filter(x => !x.done).reduce((a, x) => a + x.price, 0);
  const [w, setW] = useState(0);
  const [color, label] = budgetStatus(total, budget, c);
  const over = total > budget;
  const size = usePxlSize(rp(total), w);
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      <View style={[row, between]}>
        <Txt v="cap">Estimasi total</Txt>
        <View style={[row, { gap: 6 }]}>
          <Txt v="cap" m>
            dari {rp(budget)}
          </Txt>
          <Chip label="−" onPress={() => setShopBudget(budget - 5000)} />
          <Chip label="+" onPress={() => setShopBudget(budget + 5000)} />
        </View>
      </View>
      <Pxl size={size} color={c.ink} style={{ marginTop: 6, marginBottom: 12 }}>
        {rp(total)}
      </Pxl>
      <Bar pct={Math.min(100, (total / budget) * 100)} color={color} label="Estimasi dari budget belanja" />
      <Txt b color={over ? c.danger : c.daun} style={{ marginTop: 10 }}>
        {over ? `Lewat ${rp(total - budget)}` : `Sisa ${rp(budget - total)}. Masih cukup nih.`} {label}
      </Txt>
      <Txt v="cap" style={{ marginBottom: 16 }}>
        Belum dibeli: {rp(remaining)}
      </Txt>
      <View style={{ gap: 10 }}>
        <Btn full icon="pin_drop" title="Cari tempat murah" onPress={() => router.push("/spots")} />
        {doneCount ? <Btn full ghost title={`Hapus ${doneCount} yang sudah dibeli`} onPress={clearDone} /> : null}
      </View>
    </View>
  );
}
