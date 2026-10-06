import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp, IngredientCategory } from "../../context/AppContext";
import colors from "../../constants/colors";
import { formatRp, tabularNums } from "../../constants/format";
import { CONTENT_MAX_WIDTH, Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button, IconName } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { Tag } from "../../components/Tag";
import { IconButton } from "../../components/IconButton";
import { TextField } from "../../components/TextField";
import { Dialog } from "../../components/Dialog";
import { Toast, useToast } from "../../components/Toast";

const CATEGORIES: IngredientCategory[] = [
  "Sayuran & Segar",
  "Protein",
  "Bumbu & Cabai",
];

const CATEGORY_ICONS: Record<IngredientCategory, IconName> = {
  "Sayuran & Segar": "leaf-outline",
  Protein: "egg-outline",
  "Bumbu & Cabai": "flame-outline",
};

export default function ShoppingScreen() {
  const {
    shoppingList,
    toggleShoppingItem,
    addShoppingItem,
    removeShoppingItem,
    clearCompletedShopping,
  } = useApp();
  const { toast, show: showNotice } = useToast();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1 porsi");
  const [price, setPrice] = useState<string>("3000");
  const [category, setCategory] = useState<IngredientCategory>("Sayuran & Segar");
  // Measured so the list can always scroll clear of the fixed summary bar.
  const [summaryHeight, setSummaryHeight] = useState<number>(160);

  // Calculation
  const totalEstimatedCost = shoppingList.reduce((acc, curr) => acc + curr.price, 0);

  const budgetBenchmark = 35000;
  const savings = Math.max(0, budgetBenchmark - totalEstimatedCost);
  const savingsPercent = Math.round((savings / budgetBenchmark) * 100);

  const handleAddNew = () => {
    if (!name.trim()) return;
    addShoppingItem({
      name: name.trim(),
      quantity: quantity.trim() || "1",
      price: parseInt(price, 10) || 0,
      category,
    });
    setName("");
    setQuantity("1 porsi");
    setPrice("3000");
    setModalVisible(false);
    showNotice(`Ditambahkan: "${name}"`);
  };

  const summaryBar = (
    <View
      onLayout={e => setSummaryHeight(e.nativeEvent.layout.height)}
      className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface"
      style={{ boxShadow: "0px -4px 16px rgba(42,34,29,0.08)" }}
    >
      <View className="w-full self-center px-4 pb-4 pt-3" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
        <View className="flex-row items-end justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-muted">Total Estimasi Modal Belanja</Text>
            <Text className="text-2xl font-bold text-ink" style={tabularNums}>
              {formatRp(totalEstimatedCost)}
            </Text>
          </View>
          <View className="items-end">
            <Tag tone="leaf" label={`Hemat ${savingsPercent}% (${formatRp(savings)})`} />
            <Text className="mt-1 text-xs text-muted">
              Benchmark Target: {formatRp(budgetBenchmark)}
            </Text>
          </View>
        </View>
        <Button
          className="mt-3"
          title="Selesai Belanja • Simpan ke Pengeluaran Kos"
          onPress={() => showNotice("Dicatat ke riwayat Pengeluaran Kos minggu ini!")}
        />
      </View>
    </View>
  );

  return (
    <Screen
      bottomInset={summaryHeight + 24}
      overlay={
        <>
          {summaryBar}
          <Toast toast={toast} bottom={summaryHeight + 12} />
        </>
      }
    >
      <Card className="mb-7">
        <View className="flex-row items-start justify-between gap-3">
          <Text accessibilityRole="header" className="flex-1 text-lg font-bold text-ink">
            Smart Shopping List
          </Text>
          <Tag label="Warung Checklist" />
        </View>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Otomatis terkelompok sesuai lorong warung & pasar. Centang barang saat belanja!
        </Text>
        <View className="mt-4 flex-row gap-2">
          <Button
            className="flex-1"
            variant="secondary"
            title="+ Tambah Bahan"
            onPress={() => setModalVisible(true)}
          />
          <Button
            variant="secondary"
            icon="trash-outline"
            title="Bersihkan"
            onPress={clearCompletedShopping}
          />
        </View>
      </Card>

      {shoppingList.length === 0 ? (
        <Card className="items-center py-8">
          <Ionicons name="basket-outline" size={32} color={colors.muted} />
          <Text className="mt-3 text-base font-semibold text-ink">Daftar belanja masih kosong</Text>
          <Text className="mt-1 text-center text-sm text-muted">
            Tambah bahan di atas, atau kirim bahan resep dari AI Racik dan Komunitas.
          </Text>
        </Card>
      ) : null}

      {CATEGORIES.map(cat => {
        const items = shoppingList.filter(i => i.category === cat);
        if (items.length === 0) return null;

        return (
          <View key={cat} className="mb-6">
            <View className="mb-2 flex-row items-center">
              <Ionicons name={CATEGORY_ICONS[cat]} size={18} color={colors.muted} />
              <Text accessibilityRole="header" className="ml-2 text-base font-bold text-ink">
                {cat} ({items.length})
              </Text>
            </View>

            <Card padded={false}>
              {items.map((item, index) => (
                <View
                  key={item.id}
                  className={`flex-row items-center pr-1 ${index > 0 ? "border-t border-line" : ""}`}
                >
                  <TouchableOpacity
                    role="checkbox"
                    aria-checked={item.checked}
                    accessibilityLabel={`${item.name}, ${formatRp(item.price)}`}
                    activeOpacity={0.7}
                    onPress={() => toggleShoppingItem(item.id)}
                    className="min-h-[60px] flex-1 flex-row items-center py-3 pl-4"
                  >
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                        item.checked ? "border-leaf bg-leaf" : "border-field bg-surface"
                      }`}
                    >
                      {item.checked ? (
                        <Ionicons name="checkmark" size={16} color={colors.surface} />
                      ) : null}
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        className={`text-base font-semibold ${
                          item.checked ? "text-muted line-through" : "text-ink"
                        }`}
                      >
                        {item.name}
                      </Text>
                      <Text className="mt-0.5 text-sm text-muted">
                        {item.quantity} {item.recipe_title ? `• Dari: ${item.recipe_title}` : ""}
                      </Text>
                    </View>
                    <Text
                      className={`ml-2 text-sm font-semibold ${item.checked ? "text-muted" : "text-ink"}`}
                      style={tabularNums}
                    >
                      {formatRp(item.price)}
                    </Text>
                  </TouchableOpacity>
                  <IconButton
                    icon="close"
                    label={`Hapus ${item.name}`}
                    onPress={() => removeShoppingItem(item.id)}
                  />
                </View>
              ))}
            </Card>
          </View>
        );
      })}

      <Dialog visible={modalVisible} onClose={() => setModalVisible(false)} placement="sheet">
        <Text accessibilityRole="header" className="mb-4 text-lg font-bold text-ink">
          + Tambah Barang Belanja
        </Text>

        <TextField
          label="Nama Barang:"
          placeholder="Misal: Telur Ayam, Bawang Merah..."
          value={name}
          onChangeText={setName}
          containerClassName="mb-3"
        />
        {/* items-end keeps the two inputs aligned if one label wraps */}
        <View className="mb-3 flex-row items-end gap-3">
          <TextField
            label="Takaran / Jumlah:"
            placeholder="Misal: 1 ikat, 2 butir, 250 gram..."
            value={quantity}
            onChangeText={setQuantity}
            containerClassName="flex-1"
          />
          <TextField
            label="Estimasi Harga (Rp):"
            placeholder="3000"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            containerClassName="flex-1"
          />
        </View>

        <Text className="mb-1.5 text-sm font-semibold text-ink">Kategori:</Text>
        <View role="radiogroup" className="mb-5 flex-row flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Chip
              key={cat}
              role="radio"
              label={cat}
              selected={category === cat}
              trailingIcon={category === cat ? "checkmark" : undefined}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>

        <View className="flex-row gap-2">
          <Button
            className="flex-1"
            variant="secondary"
            title="Batal"
            onPress={() => setModalVisible(false)}
          />
          <Button className="flex-1" title="Simpan" onPress={handleAddNew} />
        </View>
      </Dialog>
    </Screen>
  );
}
