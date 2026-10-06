import React from "react";
import { Tabs } from "expo-router";
import { ColorValue, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import type { IconName } from "../../components/Button";

// Filled glyph for the active tab, outline for the rest, so the active tab is
// marked by shape as well as by color.
function tabIcon(active: IconName, inactive: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Smaller labels so five tabs fit side by side on the narrowest phones.
  const narrow = useWindowDimensions().width < 360;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 17, fontWeight: "700", color: colors.ink },
        sceneStyle: { backgroundColor: colors.cream },
        // Taller than the default so labels are not clipped; the inset keeps
        // it above the iPhone home indicator.
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 64 + insets.bottom,
          paddingTop: 4,
          paddingBottom: 4 + insets.bottom,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: narrow ? 10 : 11, lineHeight: 14, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "AI Racik",
          headerTitle: "Share'N'Bite • AI Racik",
          tabBarIcon: tabIcon("restaurant", "restaurant-outline"),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "Belanja",
          headerTitle: "Daftar Belanja Warung",
          tabBarIcon: tabIcon("basket", "basket-outline"),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Buat Resep",
          headerTitle: "Recipe Creator Lab",
          tabBarIcon: tabIcon("create", "create-outline"),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Komunitas",
          headerTitle: "Komunitas Resep Anak Kos",
          tabBarIcon: tabIcon("people", "people-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cuan & Kos",
          headerTitle: "Finansial Kos & Level",
          tabBarIcon: tabIcon("wallet", "wallet-outline"),
        }}
      />
    </Tabs>
  );
}
