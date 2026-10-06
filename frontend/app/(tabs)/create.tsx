import React, { useState, useEffect, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp, Ingredient } from "../../context/AppContext";
import colors from "../../constants/colors";
import { formatRp, tabularNums } from "../../constants/format";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { IconButton } from "../../components/IconButton";
import { SectionHeader } from "../../components/SectionHeader";
import { TextField } from "../../components/TextField";
import { RecipeImage } from "../../components/RecipeImage";
import { DashedLine } from "../../components/Receipt";
import { Dialog } from "../../components/Dialog";
import { Toast, useToast } from "../../components/Toast";

const AVAILABLE_TAGS = [
  "High Protein",
  "Pedas Gurih",
  "10 Menit Masak",
  "Porsi Kenyang",
  "Tanpa Minyak Jahat",
  "Menu Tanggal Tua",
];

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { activeDraft, setActiveDraft, publishRecipe } = useApp();
  const { toast, show: showToast } = useToast();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const formRef = useRef<View>(null);

  const [title, setTitle] = useState<string>("");
  const [titleMissing, setTitleMissing] = useState<boolean>(false);
  const [publishedTitle, setPublishedTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [prepTime, setPrepTime] = useState<string>("10");
  const [servings, setServings] = useState<string>("1");
  const [imageUri, setImageUri] = useState<string>(
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(["High Protein"]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: "ing-c1",
      name: "Tempe Kedelai",
      quantity: "1 papan",
      price: 5000,
      category: "Protein",
    },
    {
      id: "ing-c2",
      name: "Bawang Merah & Putih",
      quantity: "4 siung",
      price: 2000,
      category: "Bumbu & Cabai",
    },
  ]);
  const [instructions, setInstructions] = useState<string[]>([
    "Siapkan bahan dan potong sesuai selera.",
    "Tumis bumbu halus dengan minyak secukupnya sampai wangi.",
  ]);

  // Load activeDraft if present
  useEffect(() => {
    if (activeDraft) {
      setTitle(activeDraft.title);
      setDescription(activeDraft.description);
      setPrepTime(activeDraft.prep_time_minutes.toString());
      setServings(activeDraft.servings.toString());
      setImageUri(activeDraft.image_url);
      setSelectedTags(activeDraft.tags);
      setIngredients(activeDraft.ingredients);
      setInstructions(activeDraft.instructions);
    }
  }, [activeDraft]);

  // Real-time Total Estimated Cost Calculation
  const totalModalCost = ingredients.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        showToast("Foto resep berhasil diunggah!");
      }
    } catch (error) {
      showToast("Pilih foto dari galeri atau gunakan foto default.", "error");
    }
  };

  const addIngredientRow = () => {
    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: "",
      quantity: "1",
      price: 2000,
      category: "Sayuran & Segar",
    };
    setIngredients([...ingredients, newIng]);
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: any
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstructionRow = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleResetToBlank = () => {
    setActiveDraft(null);
    setTitle("");
    setDescription("");
    setPrepTime("10");
    setServings("1");
    setImageUri("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80");
    setIngredients([
      { id: "ing-1", name: "Bahan 1", quantity: "1 porsi", price: 3000, category: "Sayuran & Segar" }
    ]);
    setInstructions(["Langkah 1: Siapkan bahan"]);
  };

  // Feedback is shown in-app rather than with Alert.alert, which does nothing on the web.
  const handlePublish = () => {
    if (!title.trim()) {
      setTitleMissing(true);
      // Measured now rather than cached from onLayout: on the web onLayout does not
      // fire when the form only moves (e.g. after the draft banner is removed).
      const content = contentRef.current;
      if (content) {
        formRef.current?.measureLayout(content, (_x, y) =>
          scrollRef.current?.scrollTo({ y, animated: true })
        );
      }
      return;
    }

    publishRecipe({
      title: title.trim(),
      description: description.trim() || "Resep hemat anak kos praktis dan bergizi.",
      image_url: imageUri,
      fallback_emoji: "🍳",
      is_ai_generated: Boolean(activeDraft?.is_ai_generated),
      target_budget: totalModalCost + 5000,
      actual_cost: totalModalCost,
      prep_time_minutes: parseInt(prepTime, 10) || 10,
      tags: selectedTags,
      servings: parseInt(servings, 10) || 1,
      author: "Rian Pratama",
      author_level: "Level 4: Master Masak Air",
      ingredients: ingredients.filter(i => i.name.trim() !== ""),
      instructions: instructions.filter(s => s.trim() !== ""),
    });

    setActiveDraft(null);
    setPublishedTitle(title);
  };

  const publishedDialog = (
    <Dialog visible={publishedTitle !== null} onClose={() => setPublishedTitle(null)}>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-leaf-soft">
        <Ionicons name="checkmark" size={26} color={colors.leaf} />
      </View>
      <Text accessibilityRole="header" className="mt-4 text-lg font-bold text-ink">
        Resep Berhasil Dipublish!
      </Text>
      <Text className="mt-1 text-sm leading-5 text-muted">
        Resep "{publishedTitle}" sudah tampil di Komunitas. Kamu dapat +50 XP!
      </Text>
      <Button
        className="mt-5"
        title="Lihat di Komunitas"
        onPress={() => {
          setPublishedTitle(null);
          router.push("/community");
        }}
      />
    </Dialog>
  );

  return (
    <Screen
      scrollRef={scrollRef}
      overlay={
        <>
          <Toast toast={toast} />
          {publishedDialog}
        </>
      }
    >
      <View ref={contentRef}>
        {activeDraft ? (
          <View className="mb-5 rounded-2xl bg-accent-soft p-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-bold text-accent-deep">MODE DRAF AI</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleResetToBlank}
                className="min-h-[44px] justify-center"
              >
                <Text className="text-sm font-semibold text-accent-deep underline">Batal / Reset Manual</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm leading-5 text-ink">
              Mengedit draf dari resep AI. Sesuaikan bahan, takaran, dan harga modal lokal warungmu!
            </Text>
          </View>
        ) : null}

        {/* Photo */}
        <Card padded={false} className="mb-5">
          <RecipeImage uri={imageUri} fallbackEmoji="🍳" style={{ width: "100%", aspectRatio: 16 / 9 }} />
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={handlePickImage}
            className="absolute bottom-3 right-3 min-h-[44px] flex-row items-center rounded-full bg-surface px-4"
            style={{ boxShadow: "0px 2px 8px rgba(42,34,29,0.2)" }}
          >
            <Ionicons name="camera-outline" size={18} color={colors.ink} />
            <Text className="ml-2 text-sm font-semibold text-ink">Ganti Foto</Text>
          </TouchableOpacity>
        </Card>

        {/* Recipe info */}
        <View ref={formRef}>
          <Card className="mb-5">
            <TextField
              label="Nama Resep:"
              placeholder="Misal: Orek Tempe Manis Cabe Ijo..."
              value={title}
              onChangeText={value => {
                setTitle(value);
                if (titleMissing && value.trim()) setTitleMissing(false);
              }}
              invalid={titleMissing}
            />
            {titleMissing ? (
              <View accessibilityRole="alert" className="mt-1.5 flex-row items-center">
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text className="ml-1.5 flex-1 text-sm text-danger">
                  <Text className="font-semibold">Perhatian: </Text>
                  Silakan isi nama resep terlebih dahulu!
                </Text>
              </View>
            ) : null}

            <TextField
              label="Deskripsi Singkat:"
              placeholder="Ceritakan rasa, tekstur, atau tips memasaknya..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              containerClassName="mt-4"
            />

            <View className="mt-4 flex-row items-end gap-3">
              <TextField
                label="Waktu Masak (Menit):"
                keyboardType="numeric"
                value={prepTime}
                onChangeText={setPrepTime}
                containerClassName="flex-1"
              />
              <TextField
                label="Porsi Makan:"
                keyboardType="numeric"
                value={servings}
                onChangeText={setServings}
                containerClassName="flex-1"
              />
            </View>
          </Card>
        </View>

        {/* Ingredients, totalled like a receipt */}
        <Card className="mb-5">
          <SectionHeader
            title="Rincian Bahan & Harga Modal"
            right={<Button variant="secondary" title="+ Tambah" onPress={addIngredientRow} />}
          />

          {ingredients.map((ing, idx) => (
            <View key={ing.id || idx} className={idx > 0 ? "mt-3 border-t border-line pt-3" : ""}>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-muted">Bahan #{idx + 1}</Text>
                <IconButton
                  icon="trash-outline"
                  label={`Hapus bahan #${idx + 1}`}
                  onPress={() => removeIngredient(idx)}
                />
              </View>

              <View className="flex-row gap-2">
                <TextField
                  placeholder="Nama bahan..."
                  accessibilityLabel={`Nama bahan #${idx + 1}`}
                  value={ing.name}
                  onChangeText={v => updateIngredient(idx, "name", v)}
                  containerClassName="flex-[3]"
                />
                <TextField
                  placeholder="Takaran (1 ikat)"
                  accessibilityLabel={`Takaran bahan #${idx + 1}`}
                  value={ing.quantity}
                  onChangeText={v => updateIngredient(idx, "quantity", v)}
                  containerClassName="flex-[2]"
                />
              </View>

              <View className="mt-2 flex-row items-center justify-between gap-3">
                <Text className="text-sm text-muted">Harga (Rp):</Text>
                <TextField
                  placeholder="Harga (Rp)"
                  accessibilityLabel={`Harga bahan #${idx + 1}`}
                  keyboardType="numeric"
                  value={ing.price ? ing.price.toString() : ""}
                  onChangeText={v => updateIngredient(idx, "price", parseInt(v, 10) || 0)}
                  containerClassName="w-36"
                  style={[tabularNums, { textAlign: "right" }]}
                />
              </View>
            </View>
          ))}

          <DashedLine className="mb-3 mt-4" />
          <View className="flex-row items-end justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-muted">Auto-Kalkulasi Estimasi Modal:</Text>
              <Text className="text-sm text-muted">{ingredients.length} Bahan Terinput</Text>
            </View>
            <Text className="text-2xl font-bold text-ink" style={tabularNums}>
              {formatRp(totalModalCost)}
            </Text>
          </View>
        </Card>

        {/* Steps */}
        <Card className="mb-5">
          <SectionHeader
            title="Langkah Memasak"
            right={<Button variant="secondary" title="+ Langkah" onPress={addInstructionRow} />}
          />

          {instructions.map((step, idx) => (
            <View key={idx} className="mb-2 flex-row items-start gap-2.5">
              <View className="mt-2.5 h-6 w-6 items-center justify-center rounded-full bg-ink">
                <Text className="text-xs font-bold text-white">{idx + 1}</Text>
              </View>
              <TextField
                placeholder={`Langkah ke-${idx + 1}...`}
                accessibilityLabel={`Langkah ke-${idx + 1}`}
                value={step}
                onChangeText={v => updateInstruction(idx, v)}
                multiline
                containerClassName="flex-1"
                style={{ minHeight: 64 }}
              />
              {instructions.length > 1 && (
                <IconButton
                  icon="close"
                  label={`Hapus langkah ke-${idx + 1}`}
                  onPress={() => removeInstruction(idx)}
                />
              )}
            </View>
          ))}
        </Card>

        {/* Tags */}
        <Card className="mb-7">
          <Text className="mb-3 text-sm font-semibold text-ink">Pilih Tag Resep:</Text>
          <View className="flex-row flex-wrap gap-2">
            {AVAILABLE_TAGS.map(t => {
              const active = selectedTags.includes(t);
              return (
                <Chip
                  key={t}
                  role="checkbox"
                  label={t}
                  selected={active}
                  trailingIcon={active ? "checkmark" : undefined}
                  onPress={() => toggleTag(t)}
                />
              );
            })}
          </View>
        </Card>

        <Button title="Publish ke Komunitas Anak Kos" size="lg" onPress={handlePublish} />
      </View>
    </Screen>
  );
}
