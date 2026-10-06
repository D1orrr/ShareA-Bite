import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useApp, Recipe } from "../../context/AppContext";
import colors from "../../constants/colors";
import { formatRp, tabularNums } from "../../constants/format";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { Tag } from "../../components/Tag";
import { Segmented } from "../../components/Segmented";
import { SectionHeader } from "../../components/SectionHeader";
import { TextField } from "../../components/TextField";
import { RecipeImage } from "../../components/RecipeImage";
import { DashedLine, PriceRow } from "../../components/Receipt";
import { Toast, useToast } from "../../components/Toast";

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
  const { toast, show: showNotification } = useToast();

  const [selectedBudget, setSelectedBudget] = useState<number>(15000);
  const [ingredients, setIngredients] = useState<string[]>(["Telur", "Tempe"]);
  const [customInput, setCustomInput] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["High Protein", "Pedas Gurih"]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(true);

  // Preloaded recipes for the generator
  const [generatedResults] = useState<Recipe[]>([
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
      showNotification("2 Resep Berhasil Diracik Sesuai Budget!");
    }, 1800);
  };

  const handleSendToShopping = (recipe: Recipe) => {
    addRecipeToShoppingList(recipe);
    showNotification(`Bahan "${recipe.title}" ditambahkan ke Shopping List!`);
  };

  const handleTweakInCreator = (recipe: Recipe) => {
    setActiveDraft(recipe);
    router.push("/create");
  };

  return (
    <Screen overlay={<Toast toast={toast} />}>
      {/* Budget: the number this whole screen is about */}
      <Card className="mb-7">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-sm font-semibold text-muted">Target Budget Masak</Text>
          <Tag label="Maksimal Kantong" />
        </View>
        <Text className="mt-1 text-4xl font-bold text-ink" style={tabularNums}>
          {formatRp(selectedBudget)}
        </Text>
        <Segmented
          className="mt-4"
          options={BUDGET_OPTIONS.map(budget => ({
            value: budget,
            label: `Rp ${(budget / 1000).toFixed(0)}k`,
          }))}
          value={selectedBudget}
          onChange={setSelectedBudget}
        />
      </Card>

      {/* Ingredients on hand */}
      <View className="mb-7">
        <SectionHeader
          title="Bahan Yang Ada di Kulkas / Kos"
          subtitle="Pilih atau ketik bahan yang kamu miliki:"
        />
        <View className="flex-row flex-wrap gap-2">
          {ingredients.map(item => (
            <Chip
              key={item}
              label={item}
              selected
              trailingIcon="close"
              accessibilityLabel={`Hapus ${item}`}
              onPress={() => handleRemoveIngredient(item)}
            />
          ))}
        </View>

        <View className="mt-3 flex-row items-end gap-2">
          <TextField
            containerClassName="flex-1"
            placeholder="Tambah bahan lain (contoh: Sosis, Sawi)..."
            accessibilityLabel="Tambah bahan lain"
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={handleAddCustom}
            returnKeyType="done"
          />
          <Button title="+ Tambah" variant="secondary" onPress={handleAddCustom} />
        </View>

        <Text className="mb-2 mt-4 text-sm text-muted">Bahan Populer Warung Terdekat:</Text>
        <View className="flex-row flex-wrap gap-2">
          {POPULAR_INGREDIENTS.filter(i => !ingredients.includes(i)).map(item => (
            <Chip key={item} label={`+ ${item}`} onPress={() => handleAddIngredient(item)} />
          ))}
        </View>
      </View>

      {/* Priorities */}
      <View className="mb-7">
        <SectionHeader title="Prioritas & Selera" subtitle="Filter kecerdasan resep sesuai kebutuhan:" />
        <View className="flex-row flex-wrap gap-2">
          {PRIORITY_TAGS.map(tag => {
            const active = selectedTags.includes(tag);
            return (
              <Chip
                key={tag}
                role="checkbox"
                label={tag}
                selected={active}
                trailingIcon={active ? "checkmark" : undefined}
                onPress={() => toggleTag(tag)}
              />
            );
          })}
        </View>
      </View>

      <Button
        title="Racik Resep Hemat Sekarang"
        size="lg"
        onPress={triggerGenerate}
        disabled={isGenerating}
      />

      {isGenerating ? (
        <Card className="mt-6 items-center py-8">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text className="mt-4 text-base font-semibold text-ink">Matching local warung ingredients...</Text>
          <Text className="mt-1 text-center text-sm text-muted">
            Mengoptimasi modal di bawah {formatRp(selectedBudget)}
          </Text>
        </Card>
      ) : null}

      {showResults && !isGenerating ? (
        <View className="mt-9">
          <SectionHeader
            title={`Rekomendasi Menu Hemat (${generatedResults.length})`}
            right={<Tag label="Budget Fit" tone="leaf" icon="checkmark" />}
          />

          {generatedResults.map(recipe => {
            const savings = recipe.target_budget - recipe.actual_cost;
            const savingsPercent = Math.round((savings / recipe.target_budget) * 100);

            return (
              <Card key={recipe.id} padded={false} className="mb-5">
                <View>
                  <RecipeImage
                    uri={recipe.image_url}
                    fallbackEmoji={recipe.fallback_emoji}
                    style={{ width: "100%", aspectRatio: 16 / 9 }}
                  />
                  <Tag label="AI Generated" className="absolute left-3 top-3" />
                </View>

                <View className="p-4">
                  <Text className="text-lg font-bold text-ink">{recipe.title}</Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">{recipe.description}</Text>

                  <View className="mt-3 flex-row flex-wrap gap-1.5">
                    <Tag icon="time-outline" label={`${recipe.prep_time_minutes} Mins`} />
                    {recipe.tags.map(t => (
                      <Tag key={t} label={t} />
                    ))}
                  </View>

                  <View className="mt-4 rounded-xl bg-cream px-3.5 py-3">
                    <Text className="mb-1 text-xs font-semibold text-muted">
                      Bahan & Estimasi Modal Warung:
                    </Text>
                    {recipe.ingredients.map(ing => (
                      <PriceRow
                        key={ing.id}
                        label={`${ing.name} (${ing.quantity})`}
                        value={formatRp(ing.price)}
                      />
                    ))}
                    <DashedLine className="my-2" />
                    <PriceRow label="Modal" value={formatRp(recipe.actual_cost)} strong />
                    <PriceRow label="Target" value={formatRp(recipe.target_budget)} tone="muted" />
                    <PriceRow
                      label="Hemat"
                      value={`${formatRp(savings)} (${savingsPercent}%)`}
                      tone="leaf"
                      strong
                    />
                  </View>

                  {/* Side by side on phones, stacked on very narrow screens */}
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <Button
                      className="grow basis-[136px]"
                      variant="secondary"
                      icon="basket-outline"
                      title="+ Shopping List"
                      onPress={() => handleSendToShopping(recipe)}
                    />
                    <Button
                      className="grow basis-[136px]"
                      variant="secondary"
                      icon="create-outline"
                      title="Tweak di Form"
                      onPress={() => handleTweakInCreator(recipe)}
                    />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}
