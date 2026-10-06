import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp, IngredientCategory, ShoppingItem } from "../../context/AppContext";
import { NeoCard } from "../../components/NeoCard";
import { NeoButton } from "../../components/NeoButton";
import { NeoBadge } from "../../components/NeoBadge";

const CATEGORIES: IngredientCategory[] = [
  "Sayuran & Segar",
  "Protein",
  "Bumbu & Cabai",
];

export default function ShoppingScreen() {
  const {
    shoppingList,
    toggleShoppingItem,
    addShoppingItem,
    removeShoppingItem,
    clearCompletedShopping,
  } = useApp();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1 porsi");
  const [price, setPrice] = useState<string>("3000");
  const [category, setCategory] = useState<IngredientCategory>("Sayuran & Segar");
  const [notification, setNotification] = useState<string | null>(null);

  // Calculation
  const totalEstimatedCost = shoppingList.reduce((acc, curr) => acc + curr.price, 0);
  const checkedCost = shoppingList
    .filter(i => i.checked)
    .reduce((acc, curr) => acc + curr.price, 0);

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
    showNotice(`✅ Ditambahkan: "${name}"`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <View className="flex-1 bg-[#FBF9F1]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Toast */}
        {notification ? (
          <View
            className="bg-[#99F6E4] p-3 rounded-xl border-3 border-black mb-4 flex-row items-center"
            style={{ boxShadow: "3px 3px 0px 0px #000000" }}
          >
            <Ionicons name="checkmark-circle" size={18} color="#000" />
            <Text className="font-black text-xs text-black ml-2">{notification}</Text>
          </View>
        ) : null}

        {/* Top Header Card */}
        <NeoCard bg="#99F6E4" className="mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-black text-black uppercase">
              🛒 Smart Shopping List
            </Text>
            <NeoBadge label="Warung Checklist" bg="#FFFFFF" />
          </View>
          <Text className="text-xs font-semibold text-gray-800 leading-4 mb-3">
            Otomatis terkelompok sesuai lorong warung & pasar. Centang barang saat belanja!
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="flex-1 bg-white py-2.5 px-3 rounded-xl border-3 border-black flex-row items-center justify-center"
              style={{ boxShadow: "2px 2px 0px 0px #000000" }}
            >
              <Ionicons name="add" size={18} color="#000" />
              <Text className="font-black text-xs text-black ml-1 uppercase">
                + Tambah Bahan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearCompletedShopping}
              className="bg-[#FBCFE8] py-2.5 px-3 rounded-xl border-3 border-black flex-row items-center justify-center"
              style={{ boxShadow: "2px 2px 0px 0px #000000" }}
            >
              <Ionicons name="trash-outline" size={16} color="#000" />
              <Text className="font-black text-xs text-black ml-1 uppercase">
                Bersihkan
              </Text>
            </TouchableOpacity>
          </View>
        </NeoCard>

        {/* Categories Grouping */}
        {CATEGORIES.map(cat => {
          const items = shoppingList.filter(i => i.category === cat);
          if (items.length === 0) return null;

          const catColor =
            cat === "Sayuran & Segar"
              ? "#86EFAC"
              : cat === "Protein"
              ? "#FEF08A"
              : "#FBCFE8";

          return (
            <View key={cat} className="mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className="px-3 py-1 rounded-lg border-2 border-black flex-row items-center"
                  style={{ backgroundColor: catColor }}
                >
                  <Text className="font-black text-xs text-black uppercase">
                    {cat} ({items.length})
                  </Text>
                </View>
              </View>

              {items.map(item => (
                <View
                  key={item.id}
                  className={`bg-white rounded-xl border-3 border-black p-3 mb-2 flex-row items-center justify-between ${
                    item.checked ? "opacity-60 bg-gray-100" : ""
                  }`}
                  style={{
                    boxShadow: item.checked ? "none" : "3px 3px 0px 0px #000000",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => toggleShoppingItem(item.id)}
                    className="flex-row items-center flex-1 mr-2"
                  >
                    <View
                      className={`w-6 h-6 rounded-md border-2 border-black items-center justify-center mr-3 ${
                        item.checked ? "bg-[#86EFAC]" : "bg-white"
                      }`}
                    >
                      {item.checked && (
                        <Ionicons name="checkmark" size={16} color="#000" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-black text-sm text-black ${
                          item.checked ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-[11px] font-semibold text-gray-600">
                        {item.quantity} {item.recipe_title ? `• Dari: ${item.recipe_title}` : ""}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View className="flex-row items-center gap-2">
                    <Text className="font-black text-xs text-black">
                      Rp {item.price.toLocaleString("id-ID")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeShoppingItem(item.id)}
                      className="p-1"
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Bottom Financial Summary Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-[#FEF08A] border-t-4 border-black p-4"
        style={{ boxShadow: "0px -4px 0px 0px #000000" }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-[11px] font-black text-gray-700 uppercase">
              Total Estimasi Modal Belanja
            </Text>
            <Text className="text-xl font-black text-black">
              Rp {totalEstimatedCost.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="items-end">
            <View className="bg-[#86EFAC] px-2.5 py-1 rounded-md border-2 border-black mb-0.5">
              <Text className="text-black font-black text-xs">
                Hemat {savingsPercent}% (Rp {savings.toLocaleString("id-ID")})
              </Text>
            </View>
            <Text className="text-[10px] font-bold text-gray-700">
              Benchmark Target: Rp {budgetBenchmark.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => showNotice("💾 Dicatat ke riwayat Pengeluaran Kos minggu ini!")}
          className="bg-black py-2.5 rounded-xl border-2 border-black items-center"
        >
          <Text className="text-white font-black text-xs uppercase tracking-wider">
            Selesai Belanja • Simpan ke Pengeluaran Kos 💾
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Add Item */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View
            className="w-full max-w-sm bg-white rounded-2xl border-4 border-black p-5"
            style={{ boxShadow: "6px 6px 0px 0px #000000" }}
          >
            <Text className="text-lg font-black text-black mb-3 uppercase">
              + Tambah Barang Belanja
            </Text>

            <Text className="text-xs font-bold text-black mb-1">Nama Barang:</Text>
            <TextInput
              placeholder="Misal: Telur Ayam, Bawang Merah..."
              value={name}
              onChangeText={setName}
              className="bg-[#FBF9F1] px-3 py-2 rounded-xl border-3 border-black font-bold text-xs mb-3"
            />

            <Text className="text-xs font-bold text-black mb-1">Takaran / Jumlah:</Text>
            <TextInput
              placeholder="Misal: 1 ikat, 2 butir, 250 gram..."
              value={quantity}
              onChangeText={setQuantity}
              className="bg-[#FBF9F1] px-3 py-2 rounded-xl border-3 border-black font-bold text-xs mb-3"
            />

            <Text className="text-xs font-bold text-black mb-1">Estimasi Harga (Rp):</Text>
            <TextInput
              placeholder="3000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              className="bg-[#FBF9F1] px-3 py-2 rounded-xl border-3 border-black font-bold text-xs mb-3"
            />

            <Text className="text-xs font-bold text-black mb-1">Kategori:</Text>
            <View className="flex-row flex-wrap gap-1.5 mb-4">
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg border-2 border-black ${
                    category === cat ? "bg-black" : "bg-white"
                  }`}
                >
                  <Text
                    className={`font-black text-[11px] ${
                      category === cat ? "text-white" : "text-black"
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl border-3 border-black items-center"
              >
                <Text className="font-black text-black text-xs uppercase">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddNew}
                className="flex-1 bg-[#99F6E4] py-3 rounded-xl border-3 border-black items-center"
                style={{ boxShadow: "2px 2px 0px 0px #000000" }}
              >
                <Text className="font-black text-black text-xs uppercase">Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
