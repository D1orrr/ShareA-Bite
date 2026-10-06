import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp, Recipe } from "../../context/AppContext";
import colors from "../../constants/colors";
import { formatRp } from "../../constants/format";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { Tag } from "../../components/Tag";
import { Segmented } from "../../components/Segmented";
import { RecipeImage } from "../../components/RecipeImage";
import { Toast, useToast } from "../../components/Toast";

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

const RECIPE_FILTERS = ["Semua", "Di Bawah 12k", "High Protein"];

export default function CommunityScreen() {
  const { recipes, likeRecipe, addRecipeToShoppingList } = useApp();
  const { toast, show: showToast } = useToast(2500);
  const [activeTab, setActiveTab] = useState<CommunityTab>("resep");
  const [filterTag, setFilterTag] = useState<string>("Semua");

  const filteredRecipes = recipes.filter(r => {
    if (filterTag === "Semua") return true;
    if (filterTag === "Di Bawah 12k") return r.actual_cost <= 12000;
    if (filterTag === "High Protein") return r.tags.includes("High Protein");
    return true;
  });

  const handleLike = (id: string) => {
    likeRecipe(id);
    showToast("Resep di-upvote!");
  };

  const handleSaveToCart = (recipe: Recipe) => {
    addRecipeToShoppingList(recipe);
    showToast(`Bahan "${recipe.title}" masuk ke Shopping List!`);
  };

  return (
    <Screen overlay={<Toast toast={toast} />}>
      <View className="mb-5">
        <View className="flex-row items-center justify-between gap-3">
          <Text accessibilityRole="header" className="flex-1 text-2xl font-bold text-ink">
            Creator Community
          </Text>
          <Tag label="Anak Kos Hub" />
        </View>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Temukan resep murah, tukar tips bertahan hidup akhir bulan, dan warung tersembunyi sekitar kampus!
        </Text>
      </View>

      <Segmented
        className="mb-5"
        options={[
          { value: "resep", label: "Resep Kos" },
          { value: "tips", label: "Tips Hemat" },
          { value: "tempat", label: "Pasar Murah" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "resep" && (
        <View>
          <View role="radiogroup" className="mb-4 flex-row flex-wrap gap-2">
            {RECIPE_FILTERS.map(f => (
              <Chip
                key={f}
                role="radio"
                label={f}
                selected={filterTag === f}
                onPress={() => setFilterTag(f)}
              />
            ))}
          </View>

          {filteredRecipes.length === 0 ? (
            <Card className="items-center py-8">
              <Ionicons name="restaurant-outline" size={28} color={colors.muted} />
              <Text className="mt-3 text-center text-sm text-muted">
                Belum ada resep untuk filter ini. Coba pilih "Semua".
              </Text>
            </Card>
          ) : null}

          {filteredRecipes.map(recipe => (
            <Card key={recipe.id} padded={false} className="mb-5">
              <View>
                <RecipeImage
                  uri={recipe.image_url}
                  fallbackEmoji={recipe.fallback_emoji}
                  style={{ width: "100%", aspectRatio: 16 / 9 }}
                />
                <Tag
                  label={recipe.is_ai_generated ? "AI Generated" : "User Created"}
                  className="absolute left-3 top-3"
                />
                <Tag
                  label={`Modal: ${formatRp(recipe.actual_cost)}`}
                  className="absolute bottom-3 right-3"
                />
              </View>

              <View className="p-4">
                <Text className="text-lg font-bold text-ink">{recipe.title}</Text>
                <Text className="mt-0.5 text-sm text-muted">
                  Oleh: <Text className="font-semibold text-ink">{recipe.author}</Text> • {recipe.author_level}
                </Text>
                <Text className="mt-2 text-sm leading-5 text-ink">{recipe.description}</Text>

                <View className="mt-3 flex-row flex-wrap gap-1.5">
                  <Tag icon="time-outline" label={`${recipe.prep_time_minutes} Min`} />
                  {recipe.tags.map(t => (
                    <Tag key={t} label={t} />
                  ))}
                </View>

                <View className="mt-4 flex-row items-center justify-between gap-2 border-t border-line pt-3">
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Suka resep ${recipe.title}, ${recipe.likes} suka`}
                    activeOpacity={0.7}
                    onPress={() => handleLike(recipe.id)}
                    className="min-h-[44px] flex-row items-center rounded-full border border-field px-4"
                  >
                    <Ionicons name="heart" size={18} color={colors.accent} />
                    <Text className="ml-1.5 text-sm font-semibold text-ink">{recipe.likes} Suka</Text>
                  </TouchableOpacity>

                  <Button
                    variant="secondary"
                    icon="basket-outline"
                    title="+ Belanja"
                    onPress={() => handleSaveToCart(recipe)}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {activeTab === "tips" && (
        <View>
          {TIPS_DATA.map(tip => (
            <Card key={tip.id} className="mb-4">
              <View className="flex-row items-center justify-between">
                <Tag label={tip.tag} tone="leaf" />
                <View
                  accessible
                  accessibilityLabel={`${tip.likes} suka`}
                  className="flex-row items-center"
                >
                  <Ionicons name="heart" size={14} color={colors.accent} />
                  <Text className="ml-1 text-sm text-muted">{tip.likes}</Text>
                </View>
              </View>
              <Text className="mt-3 text-base font-bold text-ink">{tip.title}</Text>
              <Text className="mt-1 text-sm leading-5 text-ink">{tip.content}</Text>
              <Text className="mt-3 text-xs text-muted">Ditulis oleh: {tip.author}</Text>
            </Card>
          ))}
        </View>
      )}

      {activeTab === "tempat" && (
        <View>
          {CHEAP_SPOTS.map(spot => (
            <Card key={spot.id} className="mb-4">
              <View className="flex-row items-start justify-between gap-3">
                <Text className="flex-1 text-base font-bold text-ink">{spot.name}</Text>
                <Tag label={spot.avgCost} />
              </View>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="location-outline" size={15} color={colors.muted} />
                <Text className="ml-1 flex-1 text-sm text-muted">{spot.location}</Text>
              </View>
              <View className="mt-3 rounded-xl bg-cream p-3">
                <Text className="text-sm leading-5 text-ink">
                  <Text className="font-semibold">Kenapa Murah:</Text> {spot.highlight}
                </Text>
              </View>
              <Text className="mt-3 text-xs text-muted">Rekomendasi dari: {spot.author}</Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
