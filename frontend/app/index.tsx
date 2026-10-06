import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";

export default function HomeScreen() {
  const [backendStatus, setBackendStatus] = useState<string>("checking...");
  const [dbStatus, setDbStatus] = useState<string>("waiting...");
  const [imageError, setImageError] = useState<boolean>(false);

  // Check FastAPI Backend Health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Works on Web (localhost) and Mobile
        const baseUrl = Platform.OS === "web" ? "http://localhost:8000" : "http://10.0.2.2:8000";
        const res = await fetch(`${baseUrl}/api/health`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setBackendStatus(data.status === "healthy" ? "CONNECTED ⚡" : "ISSUE ⚠️");
          setDbStatus(data.database === "connected" ? "SQLITE OK 💾" : "DB ERROR ❌");
        } else {
          setBackendStatus("OFFLINE ⚠️");
        }
      } catch (err) {
        setBackendStatus("OFFLINE (Run Backend) 🔌");
        setDbStatus("STANDBY");
      }
    };

    checkBackend();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-[#FBF9F1]"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Neo-brutalist Pitch Hero Banner */}
      <View
        className="bg-[#FEF08A] p-5 rounded-2xl border-4 border-black mb-6"
        style={{
          boxShadow: "5px 5px 0px 0px #000000",
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="bg-black px-3 py-1 rounded-md">
            <Text className="text-white text-xs font-black tracking-widest uppercase">
              THIN MVP • VENTURE PITCH
            </Text>
          </View>
          <View className="bg-[#99F6E4] px-2.5 py-1 rounded-md border-2 border-black">
            <Text className="text-black font-extrabold text-xs">v0.1.0</Text>
          </View>
        </View>

        <Text className="text-3xl font-black text-black tracking-tight mt-1">
          Share'N'Bite 🍳
        </Text>
        <Text className="text-sm font-bold text-gray-800 mt-1 leading-5">
          Budget-First Recipe Generator & Smart Kos Financial Assistant
        </Text>

        {/* Backend Live Health Badge */}
        <View className="flex-row flex-wrap gap-2 mt-4 pt-3 border-t-2 border-dashed border-black">
          <View className="bg-white px-3 py-1.5 rounded-lg border-2 border-black flex-row items-center">
            <Text className="text-xs font-black text-black">
              API: <Text className="text-emerald-700">{backendStatus}</Text>
            </Text>
          </View>
          <View className="bg-white px-3 py-1.5 rounded-lg border-2 border-black flex-row items-center">
            <Text className="text-xs font-black text-black">
              DB: <Text className="text-indigo-700">{dbStatus}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Neo-brutalist Food Card Preview */}
      <View
        className="bg-white rounded-2xl border-4 border-black overflow-hidden mb-6"
        style={{
          boxShadow: "5px 5px 0px 0px #000000",
        }}
      >
        {/* Real Food Image Hero Banner with Fallback Badge */}
        <View className="relative h-44 w-full bg-[#BAE6FD] border-b-4 border-black justify-center items-center overflow-hidden">
          {!imageError ? (
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
              }}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="items-center justify-center">
              <Text className="text-5xl">🍲</Text>
              <Text className="font-black text-xs mt-1">LOCAL WARUNG SPECIAL</Text>
            </View>
          )}

          {/* AI Badge Overlay */}
          <View className="absolute top-3 left-3 bg-[#99F6E4] px-3 py-1 rounded-md border-2 border-black">
            <Text className="text-black font-black text-xs">✨ AI Generated</Text>
          </View>

          {/* Price Tag Pill */}
          <View className="absolute bottom-3 right-3 bg-[#FEF08A] px-3 py-1 rounded-lg border-2 border-black">
            <Text className="text-black font-black text-xs">Rp 12.500 / porsi</Text>
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xl font-black text-black">
              Tumis Kangkung Tempe Gurih
            </Text>
          </View>
          <Text className="text-xs font-semibold text-gray-700 mb-3">
            Target Budget: Rp 15.000 • Sisa Kantong: +Rp 2.500 (Hemat 17%)
          </Text>

          {/* Neo-brutalist Chips */}
          <View className="flex-row flex-wrap gap-1.5 mb-4">
            <View className="bg-[#FBCFE8] px-2.5 py-1 rounded border-2 border-black">
              <Text className="text-[11px] font-black">🔥 Pedas Gurih</Text>
            </View>
            <View className="bg-[#BAE6FD] px-2.5 py-1 rounded border-2 border-black">
              <Text className="text-[11px] font-black">💪 High Protein</Text>
            </View>
            <View className="bg-[#FEF08A] px-2.5 py-1 rounded border-2 border-black">
              <Text className="text-[11px] font-black">⚡ 10 Menit Masak</Text>
            </View>
          </View>

          {/* Neo-brutalist Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#99F6E4] py-3 rounded-xl border-3 border-black items-center"
            style={{
              boxShadow: "3px 3px 0px 0px #000000",
            }}
          >
            <Text className="text-black font-black text-sm uppercase tracking-wider">
              Lihat Resep & Hitung Modal 🛒
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thin MVP Roadmap Progress */}
      <View
        className="bg-[#FBCFE8] p-4 rounded-2xl border-4 border-black mb-4"
        style={{
          boxShadow: "5px 5px 0px 0px #000000",
        }}
      >
        <Text className="text-lg font-black text-black mb-2">
          🚀 Step 1 Completed: Monorepo Setup
        </Text>
        <Text className="text-xs font-bold text-gray-800 leading-5">
          • Backend: FastAPI + SQLite + Uvicorn + Gemini client scaffolded{"\n"}
          • Frontend: Expo Router + NativeWind (Tailwind) + Web & Mobile support{"\n"}
          • Design: Neo-brutalism system (Cream canvas, 4px borders, hard shadows)
        </Text>
      </View>
    </ScrollView>
  );
}
