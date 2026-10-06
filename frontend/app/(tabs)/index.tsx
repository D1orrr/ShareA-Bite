import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp, Recipe } from "../../context/AppContext";
import { NeoCard } from "../../components/NeoCard";
import { NeoButton } from "../../components/NeoButton";
import { NeoBadge } from "../../components/NeoBadge";

const BUDGET_OPTIONS = [10000, 15000, 20000, 25000, 35000];

const POPULAR_INGREDIENTS = [
  "Telur",
  "Tempe",
  "Tahu",
  "Kangkung",
  "Bawang Merah",
  "Cabai Rawit",
  "Buncis",
  "Tauge",
];

const PRIORITY_TAGS = [
  "High Protein",
  "Pedas Gurih",
  "10 Menit Masak",
  "Porsi Kenyang",
  "Tanpa Minyak Jahat",
  "Hemat Ekstrem",
];

export default function GeneratorScreen() {
  const router = useRouter();
  const { addRecipeToShoppingList, setActiveDraft } = useApp();

  const [selectedBudget, setSelectedBudget] = useState<number>(15000);
  const [ingredients, setIngredients] = useState<string[]>(["Telur", "Tempe"]);
  const [customInput, setCustomInput] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["High Protein", "Pedas Gurih"]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Preloaded recipes for the generator
  const [generatedResults, setGeneratedResults] = useState<Recipe[]>([
    {
      id: "gen-1",
      title: "Orek Tempe Basah Pedas Manis",
      description: "Tempe kecap gurih legit dengan kuah meresap, aroma daun salam, dan irisan cabai rawit nendang.",
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
      fallback_emoji: "🥢",
      is_ai_generated: true,
      target_budget: 15000,
      actual_cost: 11000,
      prep_time_minutes: 12,
      tags: ["High Protein", "Pedas Gurih", "Awet 2 Hari"],
      servings: 2,
      author: "Share'N'Bite AI",
      author_level: "Algoritma Warung",
      likes: 54,
      ingredients: [
        { id: "g1-1", name: "Tempe Papan", quantity: "1 papan", price: 5000, category: "Protein" },
        { id: "g1-2", name: "Kecap Manis & Gula Jawa", quantity: "2 sdm", price: 2000, category: "Bumbu & Cabai" },
        { id: "g1-3", name: "Bawang Merah & Putih", quantity: "5 siung", price: 2000, category: "Bumbu & Cabai" },
        { id: "g1-4", name: "Cabai Rawit Merah", quantity: "6 buah", price: 2000, category: "Bumbu & Cabai" },
      ],
      instructions: [
        "Potong tempe bentuk korek api, goreng setengah matang agar tetap lembut juicy.",
        "Tumis bawang dan cabai sampai harum semerbak.",
        "Masukkan sedikit air, kecap manis, garam, dan kaldu bubuk.",
        "Masukkan tempe, masak dengan api sedang sampai bumbu mengental meresap sempurna."
      ]
    },
    {
      id: "gen-2",
      title: "Sup Telur Tomat Gurih Kuah Hangat",
      description: "Menu comfort food anak kos saat hujan atau tanggal tua: kuah kaldu segar dengan serabut telur lembut.",
      image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80",
      fallback_emoji: "🍲",
      is_ai_generated: true,
      target_budget: 15000,
      actual_cost: 9500,
      prep_time_minutes: 8,
      tags: ["Tanpa Minyak Jahat", "10 Menit Masak", "Porsi Kenyang"],
      servings: 1,
      author: "Share'N'Bite AI",
      author_level: "Algoritma Warung",
      likes: 38,
      ingredients: [
        { id: "g2-1", name: "Telur Ayam", quantity: "2 butir", price: 5000, category: "Protein" },
        { id: "g2-2", name: "Tomat Merah Segar", quantity: "2 buah", price: 2500, category: "Sayuran & Segar" },
        { id: "g2-3", name: "Bawang Putih & Daun Bawang", quantity: "2 siung", price: 2000, category: "Bumbu & Cabai" },
      ],
      instructions: [
        "Tumis bawang putih cincang dengan sedikit minyak hingga harum.",
        "Masukkan potongan tomat, tumis hingga tomat layu dan mengeluarkan air manis alami.",
        "Tuang 400ml air, tunggu mendidih, lalu bumbui garam, merica, dan kaldu.",
        "Kocok lepas telur, tuang memutar ke dalam kuah mendidih sambil diaduk perlahan membentuk serabut sutra."
      ]
    }
  ]);

  const handleAddIngredient = (item: string) => {
    if (!ingredients.includes(item)) {
      setIngredients([...ingredients, item]);
    }
  };

  const handleRemoveIngredient = (item: string) => {
    setIngredients(ingredients.filter(i => i !== item));
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      handleAddIngredient(customInput.trim());
      setCustomInput("");
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const triggerGenerate = () => {
    setIsGenerating(true);
    setShowResults(false);

    // Simulate smart LLM reasoning & matching latency with realistic animation
    setTimeout(() => {
      setIsGenerating(false);
      setShowResults(true);
      showNotification("✨ 2 Resep Berhasil Diracik Sesuai Budget!");
    }, 1800);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendToShopping = (recipe: Recipe) => {
    addRecipeToShoppingList(recipe);
    showNotification(`🛒 Bahan "${recipe.title}" ditambahkan ke Shopping List!`);
  };

  const handleTweakInCreator = (recipe: Recipe) => {
    setActiveDraft(recipe);
    router.push("/create");
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FBF9F1]"
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    >
      {/* Toast Notification */}
      {notification ? (
        <View
          className="bg-[#99F6E4] p-3 rounded-xl border-3 border-black mb-4 flex-row items-center"
          style={{ boxShadow: "3px 3px 0px 0px #000000" }}
        >
          <Ionicons name="checkmark-circle" size={20} color="#000" />
          <Text className="font-black text-black text-xs ml-2 flex-1">
            {notification}
          </Text>
        </View>
      ) : null}

      {/* Target Budget Selector Card */}
      <NeoCard bg="#FEF08A" className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-black text-black uppercase tracking-tight">
            🎯 Target Budget Masak
          </Text>
          <NeoBadge label="Maksimal Kantong" bg="#FFFFFF" />
        </View>
        <Text className="text-3xl font-black text-black mb-3">
          Rp {selectedBudget.toLocaleString("id-ID")}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {BUDGET_OPTIONS.map(budget => (
            <TouchableOpacity
              key={budget}
              onPress={() => setSelectedBudget(budget)}
              activeOpacity={0.8}
              className={`px-3 py-2 rounded-xl border-3 border-black ${
                selectedBudget === budget ? "bg-black" : "bg-white"
              }`}
              style={{
                boxShadow: selectedBudget === budget ? "none" : "2px 2px 0px 0px #000000",
              }}
            >
              <Text
                className={`font-black text-xs ${
                  selectedBudget === budget ? "text-[#FEF08A]" : "text-black"
                }`}
              >
                Rp {(budget / 1000).toFixed(0)}k
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </NeoCard>

      {/* Available Ingredients Card */}
      <NeoCard bg="#FFFFFF" className="mb-5">
        <Text className="text-base font-black text-black mb-1 uppercase">
          🥬 Bahan Yang Ada di Kulkas / Kos
        </Text>
        <Text className="text-xs font-semibold text-gray-600 mb-3">
          Pilih atau ketik bahan yang kamu miliki:
        </Text>

        {/* Selected Ingredients Badges */}
        <View className="flex-row flex-wrap gap-1.5 mb-3">
          {ingredients.map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => handleRemoveIngredient(item)}
              activeOpacity={0.7}
              className="bg-[#99F6E4] px-3 py-1.5 rounded-lg border-2 border-black flex-row items-center"
            >
              <Text className="font-black text-black text-xs mr-1">{item}</Text>
              <Ionicons name="close" size={14} color="#000" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Input */}
        <View className="flex-row gap-2 mb-3">
          <TextInput
            placeholder="Tambah bahan lain (contoh: Sosis, Sawi)..."
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={handleAddCustom}
            placeholderTextColor="#888"
            className="flex-1 bg-[#FBF9F1] px-3 py-2.5 rounded-xl border-3 border-black font-bold text-xs"
          />
          <TouchableOpacity
            onPress={handleAddCustom}
            className="bg-[#FEF08A] px-4 rounded-xl border-3 border-black justify-center items-center"
            style={{ boxShadow: "2px 2px 0px 0px #000000" }}
          >
            <Text className="font-black text-black text-xs">+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Suggestion Chips */}
        <Text className="text-[11px] font-bold text-gray-500 mb-1.5">
          Bahan Populer Warung Terdekat:
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {POPULAR_INGREDIENTS.filter(i => !ingredients.includes(i)).map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => handleAddIngredient(item)}
              className="bg-[#FBF9F1] px-2.5 py-1 rounded-md border-2 border-black"
            >
              <Text className="font-bold text-[11px] text-black">+ {item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </NeoCard>

      {/* Priority Chips */}
      <NeoCard bg="#FBCFE8" className="mb-5">
        <Text className="text-base font-black text-black mb-1 uppercase">
          ⚡ Prioritas & Selera
        </Text>
        <Text className="text-xs font-semibold text-gray-700 mb-3">
          Filter kecerdasan resep sesuai kebutuhan:
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {PRIORITY_TAGS.map(tag => {
            const active = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg border-2 border-black ${
                  active ? "bg-black" : "bg-white"
                }`}
                style={{
                  boxShadow: active ? "none" : "2px 2px 0px 0px #000000",
                }}
              >
                <Text
                  className={`font-black text-xs ${
                    active ? "text-[#FBCFE8]" : "text-black"
                  }`}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </NeoCard>

      {/* Action Button */}
      <NeoButton
        title="✨ Racik Resep Hemat Sekarang"
        size="lg"
        bg="#99F6E4"
        onPress={triggerGenerate}
        disabled={isGenerating}
        className="mb-6"
      />

      {/* Skeleton Loading State */}
      {isGenerating ? (
        <NeoCard bg="#BAE6FD" className="items-center py-8">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="font-black text-base text-black mt-4">
            Matching local warung ingredients...
          </Text>
          <Text className="font-bold text-xs text-gray-700 mt-1">
            Mengoptimasi modal di bawah Rp {selectedBudget.toLocaleString("id-ID")}
          </Text>
        </NeoCard>
      ) : null}

      {/* Generated Results List */}
      {showResults && !isGenerating ? (
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-black text-black uppercase">
              📋 Rekomendasi Menu Hemat ({generatedResults.length})
            </Text>
            <NeoBadge label="Budget Fit" bg="#86EFAC" />
          </View>

          {generatedResults.map(recipe => {
            const savings = recipe.target_budget - recipe.actual_cost;
            const savingsPercent = Math.round((savings / recipe.target_budget) * 100);

            return (
              <View
                key={recipe.id}
                className="bg-white rounded-2xl border-4 border-black overflow-hidden mb-6"
                style={{ boxShadow: "5px 5px 0px 0px #000000" }}
              >
                {/* Food Image Banner */}
                <View className="h-44 w-full bg-[#BAE6FD] border-b-4 border-black relative">
                  <Image
                    source={{ uri: recipe.image_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute top-3 left-3 bg-[#99F6E4] px-2.5 py-1 rounded-md border-2 border-black">
                    <Text className="text-black font-black text-xs">✨ AI Generated</Text>
                  </View>
                  <View className="absolute bottom-3 right-3 bg-[#FEF08A] px-3 py-1 rounded-lg border-2 border-black">
                    <Text className="text-black font-black text-xs">
                      Modal: Rp {recipe.actual_cost.toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <View className="p-4">
                  <Text className="text-xl font-black text-black mb-1">
                    {recipe.title}
                  </Text>
                  <Text className="text-xs font-semibold text-gray-700 mb-3 leading-5">
                    {recipe.description}
                  </Text>

                  {/* Savings Pill */}
                  <View className="bg-[#86EFAC] px-3 py-1.5 rounded-lg border-2 border-black flex-row items-center justify-between mb-3">
                    <Text className="font-black text-xs text-black">
                      💰 Hemat: Rp {savings.toLocaleString("id-ID")} ({savingsPercent}%)
                    </Text>
                    <Text className="font-bold text-[11px] text-gray-800">
                      Target: Rp {recipe.target_budget.toLocaleString("id-ID")}
                    </Text>
                  </View>

                  {/* Tags */}
                  <View className="flex-row flex-wrap gap-1.5 mb-4">
                    {recipe.tags.map(t => (
                      <View
                        key={t}
                        className="bg-[#FBCFE8] px-2 py-0.5 rounded border-2 border-black"
                      >
                        <Text className="font-bold text-[10px] text-black">{t}</Text>
                      </View>
                    ))}
                    <View className="bg-[#FEF08A] px-2 py-0.5 rounded border-2 border-black">
                      <Text className="font-bold text-[10px] text-black">
                        ⏱️ {recipe.prep_time_minutes} Mins
                      </Text>
                    </View>
                  </View>

                  {/* Ingredients Preview */}
                  <View className="bg-[#FBF9F1] p-3 rounded-xl border-2 border-black mb-4">
                    <Text className="font-black text-xs text-black mb-2 uppercase">
                      Bahan & Estimasi Modal Warung:
                    </Text>
                    {recipe.ingredients.map(ing => (
                      <View
                        key={ing.id}
                        className="flex-row justify-between py-1 border-b border-dashed border-gray-300"
                      >
                        <Text className="text-xs font-bold text-gray-800">
                          • {ing.name} ({ing.quantity})
                        </Text>
                        <Text className="text-xs font-black text-black">
                          Rp {ing.price.toLocaleString("id-ID")}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleSendToShopping(recipe)}
                      className="flex-1 bg-[#99F6E4] py-3 rounded-xl border-3 border-black items-center"
                      style={{ boxShadow: "3px 3px 0px 0px #000000" }}
                    >
                      <Text className="font-black text-black text-xs uppercase">
                        🛒 + Shopping List
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleTweakInCreator(recipe)}
                      className="flex-1 bg-[#FEF08A] py-3 rounded-xl border-3 border-black items-center"
                      style={{ boxShadow: "3px 3px 0px 0px #000000" }}
                    >
                      <Text className="font-black text-black text-xs uppercase">
                        ✏️ Tweak di Form
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}
