import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { NeoCard } from "../../components/NeoCard";
import { NeoBadge } from "../../components/NeoBadge";

type CommunityTab = "resep" | "tips" | "tempat";

interface BudgetTip {
  id: string;
  title: string;
  content: string;
  author: string;
  tag: string;
  likes: number;
}

interface CheapSpot {
  id: string;
  name: string;
  location: string;
  highlight: string;
  avgCost: string;
  author: string;
}

const TIPS_DATA: BudgetTip[] = [
  {
    id: "tip-1",
    title: "Beli Bumbu & Sayur di Pasar Jam 6 Pagi",
    content: "Di Pasar Slipi atau Palmerah, belanja sayur subuh langsung dapet potongan 30-40% dibanding minimarket. Bawang merah 1 ons cuma 3 ribu!",
    author: "Dimas (Binus Palmerah)",
    tag: "Pasar Hack",
    likes: 124,
  },
  {
    id: "tip-2",
    title: "Cara Nyimpen Kangkung Biar Gak Busuk di Kulkas Kos",
    content: "Jangan dicuci dulu! Potong akarnya sedikit, bungkus kertas koran atau tisu basah kering, masukkan wadah kedap. Bisa tahan 5-7 hari tetap renyah.",
    author: "Siti Rahma",
    tag: "Food Prep",
    likes: 98,
  },
  {
    id: "tip-3",
    title: "Kombinasi Protein Murah: Tempe + Telur",
    content: "Jangan beli daging beku kalau budget menipis. 1 butir telur + 1/2 papan tempe total modal Rp 4.500 udah dapet 22g protein murni buat gym!",
    author: "Rian Pratama",
    tag: "Nutrisi Hemat",
    likes: 76,
  },
];

const CHEAP_SPOTS: CheapSpot[] = [
  {
    id: "spot-1",
    name: "Pasar Kopro (Tanjung Duren)",
    location: "5 Menit dari Kampus Anggrek",
    highlight: "Tempe kedelai jumbo 3 papan cuma Rp 10.000. Sayur bayam/kangkung Rp 2.500/ikat.",
    avgCost: "Rp 5.000 - Rp 15.000",
    author: "Anak Kos Anggrek",
  },
  {
    id: "spot-2",
    name: "Tukang Sayur Gerobak Gang U",
    location: "Depan Indomaret Syahdan",
    highlight: "Bisa beli cabai eceran Rp 1.000 & bumbu dapur campur racikan.",
    avgCost: "Rp 2.000 - Rp 10.000",
    author: "Warga Kos U",
  },
  {
    id: "spot-3",
    name: "Warung Beras Bu Joko",
    location: "Jl. KH Syahdan",
    highlight: "Beras pulen per liter bisa ngecer, telur per butir Rp 2.200 (lebih murah dari alfa).",
    avgCost: "Rp 10.000 / kg",
    author: "Rian Pratama",
  },
];

export default function CommunityScreen() {
  const { recipes, likeRecipe, addRecipeToShoppingList } = useApp();
  const [activeTab, setActiveTab] = useState<CommunityTab>("resep");
  const [filterTag, setFilterTag] = useState<string>("Semua");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredRecipes = recipes.filter(r => {
    if (filterTag === "Semua") return true;
    if (filterTag === "Di Bawah 12k") return r.actual_cost <= 12000;
    if (filterTag === "High Protein") return r.tags.includes("High Protein");
    return true;
  });

  const handleLike = (id: string) => {
    likeRecipe(id);
    setToastMessage("❤️ Resep di-upvote!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveToCart = (recipe: any) => {
    addRecipeToShoppingList(recipe);
    setToastMessage(`🛒 Bahan "${recipe.title}" masuk ke Shopping List!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FBF9F1]"
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    >
      {/* Toast Notice */}
      {toastMessage ? (
        <View
          className="bg-[#99F6E4] p-3 rounded-xl border-3 border-black mb-4 flex-row items-center"
          style={{ boxShadow: "3px 3px 0px 0px #000000" }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#000" />
          <Text className="font-black text-xs text-black ml-2">{toastMessage}</Text>
        </View>
      ) : null}

      {/* Community Header Banner */}
      <NeoCard bg="#BAE6FD" className="mb-5">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xl font-black text-black uppercase">
            🌐 Creator Community
          </Text>
          <NeoBadge label="Anak Kos Hub" bg="#FFFFFF" />
        </View>
        <Text className="text-xs font-semibold text-gray-800 leading-4">
          Temukan resep murah, tukar tips bertahan hidup akhir bulan, dan warung tersembunyi sekitar kampus!
        </Text>
      </NeoCard>

      {/* 3 Main Sub-Tabs */}
      <View className="flex-row gap-2 mb-5">
        <TouchableOpacity
          onPress={() => setActiveTab("resep")}
          className={`flex-1 py-2.5 rounded-xl border-3 border-black items-center ${
            activeTab === "resep" ? "bg-[#FEF08A]" : "bg-white"
          }`}
          style={{
            boxShadow: activeTab === "resep" ? "none" : "2px 2px 0px 0px #000000",
          }}
        >
          <Text className="font-black text-xs text-black uppercase">
            🍲 Resep Kos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("tips")}
          className={`flex-1 py-2.5 rounded-xl border-3 border-black items-center ${
            activeTab === "tips" ? "bg-[#99F6E4]" : "bg-white"
          }`}
          style={{
            boxShadow: activeTab === "tips" ? "none" : "2px 2px 0px 0px #000000",
          }}
        >
          <Text className="font-black text-xs text-black uppercase">
            💡 Tips Hemat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("tempat")}
          className={`flex-1 py-2.5 rounded-xl border-3 border-black items-center ${
            activeTab === "tempat" ? "bg-[#FBCFE8]" : "bg-white"
          }`}
          style={{
            boxShadow: activeTab === "tempat" ? "none" : "2px 2px 0px 0px #000000",
          }}
        >
          <Text className="font-black text-xs text-black uppercase">
            📍 Pasar Murah
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: RESEP ANAK KOS */}
      {activeTab === "resep" && (
        <View>
          {/* Filter Chips */}
          <View className="flex-row gap-2 mb-4">
            {["Semua", "Di Bawah 12k", "High Protein"].map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilterTag(f)}
                className={`px-3 py-1.5 rounded-lg border-2 border-black ${
                  filterTag === f ? "bg-black" : "bg-white"
                }`}
              >
                <Text
                  className={`font-black text-xs ${
                    filterTag === f ? "text-white" : "text-black"
                  }`}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredRecipes.map(recipe => (
            <View
              key={recipe.id}
              className="bg-white rounded-2xl border-4 border-black overflow-hidden mb-5"
              style={{ boxShadow: "4px 4px 0px 0px #000000" }}
            >
              {/* Image Banner */}
              <View className="h-40 w-full bg-[#BAE6FD] border-b-4 border-black relative">
                <Image
                  source={{ uri: recipe.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Creator or AI Badge */}
                <View
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-md border-2 border-black ${
                    recipe.is_ai_generated ? "bg-[#99F6E4]" : "bg-[#FEF08A]"
                  }`}
                >
                  <Text className="text-black font-black text-xs">
                    {recipe.is_ai_generated ? "✨ AI Generated" : "👨‍🍳 User Created"}
                  </Text>
                </View>

                {/* Price Tag */}
                <View className="absolute bottom-3 right-3 bg-white px-2.5 py-1 rounded-md border-2 border-black">
                  <Text className="font-black text-xs text-black">
                    Modal: Rp {recipe.actual_cost.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>

              <View className="p-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-lg font-black text-black">
                    {recipe.title}
                  </Text>
                </View>

                {/* Author Info */}
                <Text className="text-[11px] font-bold text-gray-600 mb-2">
                  Oleh: <Text className="text-black font-extrabold">{recipe.author}</Text>{" "}
                  • {recipe.author_level}
                </Text>

                <Text className="text-xs font-semibold text-gray-700 mb-3 leading-5">
                  {recipe.description}
                </Text>

                {/* Tags */}
                <View className="flex-row flex-wrap gap-1.5 mb-3">
                  {recipe.tags.map(t => (
                    <View
                      key={t}
                      className="bg-[#FBCFE8] px-2 py-0.5 rounded border border-black"
                    >
                      <Text className="font-bold text-[10px]">{t}</Text>
                    </View>
                  ))}
                  <View className="bg-[#FEF08A] px-2 py-0.5 rounded border border-black">
                    <Text className="font-bold text-[10px]">
                      ⏱️ {recipe.prep_time_minutes} Min
                    </Text>
                  </View>
                </View>

                {/* Bottom Actions */}
                <View className="flex-row items-center justify-between pt-2 border-t-2 border-dashed border-gray-200">
                  <TouchableOpacity
                    onPress={() => handleLike(recipe.id)}
                    className="flex-row items-center bg-[#FBF9F1] px-3 py-1.5 rounded-lg border-2 border-black"
                  >
                    <Ionicons name="heart" size={16} color="red" />
                    <Text className="font-black text-xs text-black ml-1.5">
                      {recipe.likes} Suka
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSaveToCart(recipe)}
                    className="bg-[#99F6E4] px-3 py-1.5 rounded-lg border-2 border-black flex-row items-center"
                  >
                    <Ionicons name="cart-outline" size={16} color="#000" />
                    <Text className="font-black text-xs text-black ml-1">
                      + Belanja
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* TAB 2: TIPS HEMAT */}
      {activeTab === "tips" && (
        <View>
          {TIPS_DATA.map(tip => (
            <NeoCard key={tip.id} bg="#FFFFFF" className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <View className="bg-[#99F6E4] px-2.5 py-0.5 rounded-md border-2 border-black">
                  <Text className="text-[10px] font-black text-black">
                    {tip.tag}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="heart" size={14} color="red" />
                  <Text className="text-xs font-bold text-gray-700 ml-1">
                    {tip.likes}
                  </Text>
                </View>
              </View>

              <Text className="text-base font-black text-black mt-1 mb-1">
                {tip.title}
              </Text>
              <Text className="text-xs font-semibold text-gray-700 leading-5 mb-2">
                {tip.content}
              </Text>

              <Text className="text-[11px] font-bold text-gray-500">
                Ditulis oleh: {tip.author}
              </Text>
            </NeoCard>
          ))}
        </View>
      )}

      {/* TAB 3: TEMPAT MURAH */}
      {activeTab === "tempat" && (
        <View>
          {CHEAP_SPOTS.map(spot => (
            <NeoCard key={spot.id} bg="#FFFFFF" className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-black text-black">
                  {spot.name}
                </Text>
                <View className="bg-[#FEF08A] px-2 py-0.5 rounded border border-black">
                  <Text className="text-[10px] font-black">{spot.avgCost}</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-2">
                <Ionicons name="location" size={14} color="#000" />
                <Text className="text-xs font-bold text-gray-600 ml-1">
                  {spot.location}
                </Text>
              </View>

              <View className="bg-[#FBF9F1] p-2.5 rounded-xl border border-black mb-2">
                <Text className="text-xs font-semibold text-gray-800">
                  ⭐ <Text className="font-bold">Kenapa Murah:</Text> {spot.highlight}
                </Text>
              </View>

              <Text className="text-[10px] font-bold text-gray-500">
                Rekomendasi dari: {spot.author}
              </Text>
            </NeoCard>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
