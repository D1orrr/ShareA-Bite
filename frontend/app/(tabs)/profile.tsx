import React from "react";
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

export default function ProfileScreen() {
  const { userProfile, weeklyExpenses, recipes } = useApp();

  const totalSpent = weeklyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMonthlyBudget = weeklyExpenses.reduce(
    (acc, curr) => acc + curr.budgetLimit,
    0
  );
  const remainingBudget = Math.max(0, totalMonthlyBudget - totalSpent);
  const maxWeeklyAmount = Math.max(...weeklyExpenses.map(w => w.amount), 150000);

  return (
    <ScrollView
      className="flex-1 bg-[#FBF9F1]"
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    >
      {/* User Header & Gamification Level Card */}
      <NeoCard bg="#FEF08A" className="mb-5">
        <View className="flex-row items-center gap-4 mb-4">
          <View
            className="w-16 h-16 rounded-2xl bg-[#99F6E4] border-4 border-black items-center justify-center overflow-hidden"
            style={{ boxShadow: "3px 3px 0px 0px #000000" }}
          >
            <Text className="text-3xl">👨‍🍳</Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-xl font-black text-black">
                {userProfile.name}
              </Text>
              <NeoBadge label="Level 4" bg="#FFFFFF" />
            </View>
            <Text className="text-xs font-bold text-gray-700">
              📍 {userProfile.campus} • {userProfile.recipesCount} Resep Dibagikan
            </Text>
          </View>
        </View>

        {/* Gamified Title Badge */}
        <View
          className="bg-black p-3 rounded-xl mb-3 flex-row items-center justify-between"
          style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.2)" }}
        >
          <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Gelar Kehormatan Anak Kos:
            </Text>
            <Text className="text-sm font-black text-[#FEF08A]">
              {userProfile.title}
            </Text>
          </View>
          <View className="bg-[#86EFAC] px-2 py-1 rounded border border-black">
            <Text className="text-black font-black text-[10px]">
              XP: {userProfile.xp}/{userProfile.xpNext}
            </Text>
          </View>
        </View>

        {/* Level XP Progress Bar */}
        <View className="mb-1">
          <View className="h-4 bg-white rounded-full border-2 border-black overflow-hidden p-0.5">
            <View
              className="h-full bg-[#86EFAC] rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (userProfile.xp / userProfile.xpNext) * 100
                )}%`,
              }}
            />
          </View>
          <Text className="text-[10px] font-bold text-gray-700 mt-1 text-right">
            +{userProfile.xpNext - userProfile.xp} XP lagi untuk membuka "Level 5: Sultan Warteg 👑"
          </Text>
        </View>
      </NeoCard>

      {/* Gamification Trophy Badges */}
      <NeoCard bg="#FFFFFF" className="mb-5">
        <Text className="text-sm font-black text-black mb-3 uppercase">
          🎖️ Koleksi Lencana Hemat
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <View className="bg-[#99F6E4] px-3 py-2 rounded-xl border-2 border-black flex-row items-center">
            <Text className="text-lg mr-1.5">🏆</Text>
            <View>
              <Text className="text-xs font-black text-black">Hemat 100k Club</Text>
              <Text className="text-[9px] font-bold text-gray-700">Tercapai Minggu Lalu</Text>
            </View>
          </View>

          <View className="bg-[#FBCFE8] px-3 py-2 rounded-xl border-2 border-black flex-row items-center">
            <Text className="text-lg mr-1.5">🍳</Text>
            <View>
              <Text className="text-xs font-black text-black">5 Resep Dipublish</Text>
              <Text className="text-[9px] font-bold text-gray-700">Kontributor Kos</Text>
            </View>
          </View>

          <View className="bg-[#FEF08A] px-3 py-2 rounded-xl border-2 border-black flex-row items-center">
            <Text className="text-lg mr-1.5">🛡️</Text>
            <View>
              <Text className="text-xs font-black text-black">Anti-Kanker</Text>
              <Text className="text-[9px] font-bold text-gray-700">Kantong Kering Survivor</Text>
            </View>
          </View>
        </View>
      </NeoCard>

      {/* Financial Expense Tracker Card */}
      <NeoCard bg="#FFFFFF" className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-black text-black uppercase">
            📊 Pengeluaran Belanja Kos
          </Text>
          <NeoBadge label="Bulan Ini" bg="#86EFAC" />
        </View>
        <Text className="text-xs font-semibold text-gray-600 mb-4">
          Monitor jatah belanja bahan masak vs target anggaran bulanan kos:
        </Text>

        {/* Visual Bar Chart */}
        <View className="bg-[#FBF9F1] p-4 rounded-xl border-3 border-black mb-4">
          <View className="flex-row items-end justify-between h-44 pt-4 pb-2 px-2">
            {weeklyExpenses.map(item => {
              const heightPercent = Math.max(
                15,
                Math.round((item.amount / maxWeeklyAmount) * 100)
              );
              const isOver = item.amount > item.budgetLimit;

              return (
                <View key={item.id} className="items-center flex-1 mx-1">
                  <Text className="text-[10px] font-black text-black mb-1">
                    {(item.amount / 1000).toFixed(0)}k
                  </Text>
                  <View className="w-full bg-gray-200 h-28 justify-end rounded-t-lg overflow-hidden border border-black">
                    <View
                      className={`w-full rounded-t-md ${
                        isOver ? "bg-red-400" : "bg-[#86EFAC]"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </View>
                  <Text className="text-xs font-black text-black mt-2">
                    {item.week}
                  </Text>
                  <Text className="text-[9px] font-bold text-gray-500">
                    Target 150k
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Monthly Summary Statistics */}
        <View className="bg-[#FBF9F1] p-3 rounded-xl border-2 border-black flex-row justify-between mb-3">
          <View>
            <Text className="text-[10px] font-bold text-gray-600">Total Terpakai:</Text>
            <Text className="text-base font-black text-black">
              Rp {totalSpent.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-[10px] font-bold text-gray-600">Batas Kuota:</Text>
            <Text className="text-base font-black text-black">
              Rp {totalMonthlyBudget.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-bold text-gray-600">Sisa Kuota:</Text>
            <Text className="text-base font-black text-emerald-700">
              Rp {remainingBudget.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {/* Savings Achievement Banner */}
        <View className="bg-[#86EFAC] p-3 rounded-xl border-2 border-black flex-row items-center">
          <Text className="text-2xl mr-2">💰</Text>
          <View className="flex-1">
            <Text className="text-xs font-black text-black">
              Hemat Rp {userProfile.totalSaved.toLocaleString("id-ID")} Bulan Ini!
            </Text>
            <Text className="text-[10px] font-semibold text-gray-800">
              Dibandingkan jajan pesan-antar online anak kos rata-rata.
            </Text>
          </View>
        </View>
      </NeoCard>

      {/* Published & Saved Recipes Shelf */}
      <NeoCard bg="#FFFFFF" className="mb-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-black text-black uppercase">
            📖 Koleksi Resep Buatanmu
          </Text>
          <Text className="text-xs font-black text-black">
            {recipes.length} Resep
          </Text>
        </View>

        {recipes.slice(0, 3).map(r => (
          <View
            key={r.id}
            className="flex-row items-center justify-between p-2.5 bg-[#FBF9F1] rounded-xl border-2 border-black mb-2"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Text className="text-xl mr-2">{r.fallback_emoji}</Text>
              <View className="flex-1">
                <Text className="font-black text-xs text-black" numberOfLines={1}>
                  {r.title}
                </Text>
                <Text className="text-[10px] font-semibold text-gray-600">
                  Modal: Rp {r.actual_cost.toLocaleString("id-ID")} • {r.likes} Suka
                </Text>
              </View>
            </View>
            <View className="bg-[#FEF08A] px-2 py-1 rounded border border-black">
              <Text className="text-[10px] font-black">{r.prep_time_minutes}m</Text>
            </View>
          </View>
        ))}
      </NeoCard>
    </ScrollView>
  );
}
