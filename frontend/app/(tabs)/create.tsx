import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useApp,
  IngredientCategory,
  Ingredient,
} from "../../context/AppContext";
import { NeoCard } from "../../components/NeoCard";
import { NeoButton } from "../../components/NeoButton";
import { NeoBadge } from "../../components/NeoBadge";

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

  const [title, setTitle] = useState<string>("");
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setToastMessage("📸 Foto resep berhasil diunggah!");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      Alert.alert("Info", "Pilih foto dari galeri atau gunakan foto default.");
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

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert("Perhatian", "Silakan isi nama resep terlebih dahulu!");
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
    Alert.alert(
      "Resep Berhasil Dipublish! 🎉",
      `Resep "${title}" sudah tampil di Komunitas. Kamu dapat +50 XP!`,
      [{ text: "Lihat di Komunitas", onPress: () => router.push("/community") }]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FBF9F1]"
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    >
      {/* Toast */}
      {toastMessage ? (
        <View
          className="bg-[#99F6E4] p-3 rounded-xl border-3 border-black mb-4 flex-row items-center"
          style={{ boxShadow: "3px 3px 0px 0px #000000" }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#000" />
          <Text className="font-black text-xs text-black ml-2">{toastMessage}</Text>
        </View>
      ) : null}

      {/* AI Draft Banner */}
      {activeDraft ? (
        <View
          className="bg-[#FEF08A] p-4 rounded-2xl border-4 border-black mb-5"
          style={{ boxShadow: "4px 4px 0px 0px #000000" }}
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="bg-black px-2.5 py-0.5 rounded">
              <Text className="text-white text-[10px] font-black uppercase">
                ✨ MODE DRAF AI
              </Text>
            </View>
            <TouchableOpacity onPress={handleResetToBlank}>
              <Text className="text-xs font-black text-red-600 underline">
                Batal / Reset Manual
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm font-black text-black">
            Mengedit draf dari resep AI. Sesuaikan bahan, takaran, dan harga modal lokal warungmu!
          </Text>
        </View>
      ) : null}

      {/* Sticky Real-time Modal Cost Indicator */}
      <NeoCard bg="#99F6E4" className="mb-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[11px] font-black text-gray-800 uppercase">
              Auto-Kalkulasi Estimasi Modal:
            </Text>
            <Text className="text-2xl font-black text-black">
              Rp {totalModalCost.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="bg-white px-3 py-1.5 rounded-xl border-2 border-black">
            <Text className="text-xs font-black text-black">
              {ingredients.length} Bahan Terinput
            </Text>
          </View>
        </View>
      </NeoCard>

      {/* Image Upload Banner */}
      <View
        className="bg-white rounded-2xl border-4 border-black overflow-hidden mb-5"
        style={{ boxShadow: "4px 4px 0px 0px #000000" }}
      >
        <View className="h-44 w-full bg-gray-100 relative justify-center items-center">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.8}
            className="absolute bottom-3 right-3 bg-[#FEF08A] px-3 py-2 rounded-xl border-3 border-black flex-row items-center"
            style={{ boxShadow: "2px 2px 0px 0px #000000" }}
          >
            <Ionicons name="camera" size={16} color="#000" />
            <Text className="font-black text-xs text-black ml-1 uppercase">
              Ganti Foto 📷
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe Info Form */}
      <NeoCard bg="#FFFFFF" className="mb-5">
        <Text className="text-sm font-black text-black mb-1 uppercase">
          Nama Resep:
        </Text>
        <TextInput
          placeholder="Misal: Orek Tempe Manis Cabe Ijo..."
          value={title}
          onChangeText={setTitle}
          className="bg-[#FBF9F1] px-3 py-2.5 rounded-xl border-3 border-black font-bold text-xs mb-4"
        />

        <Text className="text-sm font-black text-black mb-1 uppercase">
          Deskripsi Singkat:
        </Text>
        <TextInput
          placeholder="Ceritakan rasa, tekstur, atau tips memasaknya..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          className="bg-[#FBF9F1] px-3 py-2.5 rounded-xl border-3 border-black font-bold text-xs mb-4"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs font-black text-black mb-1">
              Waktu Masak (Menit):
            </Text>
            <TextInput
              keyboardType="numeric"
              value={prepTime}
              onChangeText={setPrepTime}
              className="bg-[#FBF9F1] px-3 py-2 rounded-xl border-3 border-black font-bold text-xs"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-black text-black mb-1">
              Porsi Makan:
            </Text>
            <TextInput
              keyboardType="numeric"
              value={servings}
              onChangeText={setServings}
              className="bg-[#FBF9F1] px-3 py-2 rounded-xl border-3 border-black font-bold text-xs"
            />
          </View>
        </View>
      </NeoCard>

      {/* Dynamic Ingredients Section */}
      <NeoCard bg="#FFFFFF" className="mb-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-black text-black uppercase">
            🥩 Rincian Bahan & Harga Modal
          </Text>
          <TouchableOpacity
            onPress={addIngredientRow}
            className="bg-[#FEF08A] px-2.5 py-1 rounded-lg border-2 border-black"
          >
            <Text className="font-black text-xs text-black">+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {ingredients.map((ing, idx) => (
          <View
            key={ing.id || idx}
            className="bg-[#FBF9F1] p-3 rounded-xl border-2 border-black mb-2.5"
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="font-black text-xs text-black">Bahan #{idx + 1}</Text>
              <TouchableOpacity onPress={() => removeIngredient(idx)}>
                <Ionicons name="trash-outline" size={16} color="red" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2 mb-2">
              <TextInput
                placeholder="Nama bahan..."
                value={ing.name}
                onChangeText={v => updateIngredient(idx, "name", v)}
                className="flex-2 bg-white px-2 py-1.5 rounded-lg border-2 border-black font-bold text-xs flex-1"
              />
              <TextInput
                placeholder="Takaran (1 ikat)"
                value={ing.quantity}
                onChangeText={v => updateIngredient(idx, "quantity", v)}
                className="flex-1 bg-white px-2 py-1.5 rounded-lg border-2 border-black font-bold text-xs"
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-bold text-gray-700">Harga (Rp):</Text>
              <TextInput
                placeholder="Harga (Rp)"
                keyboardType="numeric"
                value={ing.price ? ing.price.toString() : ""}
                onChangeText={v =>
                  updateIngredient(idx, "price", parseInt(v, 10) || 0)
                }
                className="w-32 bg-white px-2 py-1 rounded-lg border-2 border-black font-black text-xs text-right"
              />
            </View>
          </View>
        ))}
      </NeoCard>

      {/* Step by Step Cooking Instructions */}
      <NeoCard bg="#FFFFFF" className="mb-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-black text-black uppercase">
            🍳 Langkah Memasak
          </Text>
          <TouchableOpacity
            onPress={addInstructionRow}
            className="bg-[#99F6E4] px-2.5 py-1 rounded-lg border-2 border-black"
          >
            <Text className="font-black text-xs text-black">+ Langkah</Text>
          </TouchableOpacity>
        </View>

        {instructions.map((step, idx) => (
          <View key={idx} className="flex-row items-center gap-2 mb-2">
            <View className="w-6 h-6 rounded-full bg-black items-center justify-center">
              <Text className="text-white text-xs font-black">{idx + 1}</Text>
            </View>
            <TextInput
              placeholder={`Langkah ke-${idx + 1}...`}
              value={step}
              onChangeText={v => updateInstruction(idx, v)}
              className="flex-1 bg-[#FBF9F1] px-3 py-2 rounded-xl border-2 border-black font-semibold text-xs"
            />
            {instructions.length > 1 && (
              <TouchableOpacity onPress={() => removeInstruction(idx)}>
                <Ionicons name="close" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </NeoCard>

      {/* Priority Tags */}
      <NeoCard bg="#FBCFE8" className="mb-6">
        <Text className="text-xs font-black text-black mb-2 uppercase">
          Pilih Tag Resep:
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {AVAILABLE_TAGS.map(t => {
            const active = selectedTags.includes(t);
            return (
              <TouchableOpacity
                key={t}
                onPress={() => toggleTag(t)}
                className={`px-3 py-1.5 rounded-lg border-2 border-black ${
                  active ? "bg-black" : "bg-white"
                }`}
              >
                <Text
                  className={`font-black text-xs ${
                    active ? "text-[#FBCFE8]" : "text-black"
                  }`}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </NeoCard>

      {/* Publish Action Button */}
      <NeoButton
        title="🚀 Publish ke Komunitas Anak Kos"
        size="lg"
        bg="#86EFAC"
        onPress={handlePublish}
      />
    </ScrollView>
  );
}
