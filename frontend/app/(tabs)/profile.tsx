import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import colors from "../../constants/colors";
import { formatRp, tabularNums } from "../../constants/format";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { IconName } from "../../components/Button";
import { Tag } from "../../components/Tag";
import { SectionHeader } from "../../components/SectionHeader";
import { RecipeImage } from "../../components/RecipeImage";
import { DashedLine, PriceRow } from "../../components/Receipt";

const BADGES: { icon: IconName; title: string; subtitle: string }[] = [
  { icon: "trophy-outline", title: "Hemat 100k Club", subtitle: "Tercapai Minggu Lalu" },
  { icon: "restaurant-outline", title: "5 Resep Dipublish", subtitle: "Kontributor Kos" },
  { icon: "shield-checkmark-outline", title: "Anti-Kanker", subtitle: "Kantong Kering Survivor" },
];

const CHART_HEIGHT = 140;

export default function ProfileScreen() {
  const { userProfile, weeklyExpenses, recipes } = useApp();

  const totalSpent = weeklyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMonthlyBudget = weeklyExpenses.reduce(
    (acc, curr) => acc + curr.budgetLimit,
    0
  );
  const remainingBudget = Math.max(0, totalMonthlyBudget - totalSpent);
  const maxWeeklyAmount = Math.max(...weeklyExpenses.map(w => w.amount), 150000);
  const xpPercent = Math.min(100, (userProfile.xp / userProfile.xpNext) * 100);
  const initials = userProfile.name
    .split(" ")
    .map(word => word[0])
    .slice(0, 2)
    .join("");

  return (
    <Screen>
      {/* Identity and level */}
      <Card className="mb-5">
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
            <Text className="text-xl font-bold text-accent-deep">{initials}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-xl font-bold text-ink">{userProfile.name}</Text>
              <Tag label={`Level ${userProfile.level}`} />
            </View>
            <View className="mt-1 flex-row items-center">
              <Ionicons name="location-outline" size={15} color={colors.muted} />
              <Text className="ml-1 flex-1 text-sm text-muted">
                {userProfile.campus} • {userProfile.recipesCount} Resep Dibagikan
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-xl bg-cream p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-muted">Gelar Kehormatan Anak Kos:</Text>
              <Text className="mt-0.5 text-base font-bold text-ink">{userProfile.title}</Text>
            </View>
            <Text className="text-sm font-semibold text-ink" style={tabularNums}>
              XP: {userProfile.xp}/{userProfile.xpNext}
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: userProfile.xpNext, now: userProfile.xp }}
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-track"
          >
            <View className="h-full rounded-full bg-leaf" style={{ width: `${xpPercent}%` }} />
          </View>
          <Text className="mt-2 text-xs text-muted">
            +{userProfile.xpNext - userProfile.xp} XP lagi untuk membuka "Level 5: Sultan Warteg 👑"
          </Text>
        </View>
      </Card>

      {/* Badges */}
      <View className="mb-6">
        <SectionHeader title="Koleksi Lencana Hemat" />
        <View className="flex-row gap-2">
          {BADGES.map(badge => (
            <View
              key={badge.title}
              className="flex-1 items-center rounded-xl border border-line bg-surface px-2 py-3"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-track">
                <Ionicons name={badge.icon} size={20} color={colors.ink} />
              </View>
              <Text className="mt-2 text-center text-sm font-semibold text-ink">{badge.title}</Text>
              <Text className="mt-0.5 text-center text-xs text-muted">{badge.subtitle}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly spending vs the weekly limit */}
      <Card className="mb-5">
        <SectionHeader
          title="Pengeluaran Belanja Kos"
          subtitle="Monitor jatah belanja bahan masak vs target anggaran bulanan kos:"
          right={<Tag label="Bulan Ini" tone="leaf" />}
        />

        <View className="mt-2" style={{ height: CHART_HEIGHT + 8 }}>
          <View
            className="absolute left-0 right-0"
            style={{ bottom: (CHART_HEIGHT * 150000) / maxWeeklyAmount }}
          >
            <DashedLine />
          </View>
          <View className="absolute bottom-0 left-0 right-0 top-0 flex-row items-end gap-3">
            {weeklyExpenses.map(item => {
              const isOver = item.amount > item.budgetLimit;
              const barHeight = Math.max(
                CHART_HEIGHT * 0.15,
                (CHART_HEIGHT * item.amount) / maxWeeklyAmount
              );
              // The amount sits inside the top of the bar so it never collides
              // with the target line.
              return (
                <View
                  key={item.id}
                  className={`flex-1 flex-row items-start justify-center rounded-t-lg pt-1.5 ${
                    isOver ? "bg-danger" : "bg-leaf"
                  }`}
                  style={{ height: barHeight }}
                >
                  {isOver ? <Ionicons name="alert-circle" size={12} color={colors.surface} /> : null}
                  <Text className="ml-0.5 text-xs font-semibold text-white" style={tabularNums}>
                    {(item.amount / 1000).toFixed(0)}k
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View className="flex-row gap-3 border-t border-line pt-2">
          {weeklyExpenses.map(item => (
            <Text key={item.id} className="flex-1 text-center text-xs font-semibold text-ink">
              {item.week}
            </Text>
          ))}
        </View>
        <View className="mt-2 flex-row items-center justify-end">
          <View className="w-5">
            <DashedLine />
          </View>
          <Text className="ml-1.5 text-xs text-muted">Target 150k</Text>
        </View>

        <View className="mt-4 rounded-xl bg-cream px-3.5 py-2.5">
          <PriceRow label="Total Terpakai:" value={formatRp(totalSpent)} />
          <PriceRow label="Batas Kuota:" value={formatRp(totalMonthlyBudget)} tone="muted" />
          <DashedLine className="my-1.5" />
          <PriceRow label="Sisa Kuota:" value={formatRp(remainingBudget)} tone="leaf" strong />
        </View>

        <View className="mt-3 flex-row items-center rounded-xl bg-leaf-soft p-3">
          <Ionicons name="wallet-outline" size={24} color={colors.leaf} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-ink">
              Hemat {formatRp(userProfile.totalSaved)} Bulan Ini!
            </Text>
            <Text className="text-xs text-ink">
              Dibandingkan jajan pesan-antar online anak kos rata-rata.
            </Text>
          </View>
        </View>
      </Card>

      {/* Recipe shelf */}
      <Card>
        <SectionHeader
          title="Koleksi Resep Buatanmu"
          right={<Text className="text-sm font-semibold text-muted">{recipes.length} Resep</Text>}
        />
        {recipes.slice(0, 3).map((r, index) => (
          <View
            key={r.id}
            className={`flex-row items-center py-3 ${index > 0 ? "border-t border-line" : ""}`}
          >
            <View className="overflow-hidden rounded-lg">
              <RecipeImage
                uri={r.image_url}
                fallbackEmoji={r.fallback_emoji}
                style={{ width: 48, height: 48 }}
                emojiSize={22}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                {r.title}
              </Text>
              <Text className="text-xs text-muted">
                Modal: {formatRp(r.actual_cost)} • {r.likes} Suka
              </Text>
            </View>
            <Tag icon="time-outline" label={`${r.prep_time_minutes}m`} className="ml-2" />
          </View>
        ))}
      </Card>
    </Screen>
  );
}
