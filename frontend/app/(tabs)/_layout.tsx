import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FAF7F2", // Soft warm cream header
          borderBottomWidth: 1,
          borderBottomColor: "#EFE8E1",
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
          color: "#2D2522", // Warm deep charcoal
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#EFE8E1",
          height: Platform.OS === "ios" ? 88 : 72,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 8,
          boxShadow: "0 -8px 24px rgba(45, 37, 34, 0.04)",
        },
        tabBarActiveTintColor: "#E06D53", // Terracotta Primary Accent
        tabBarInactiveTintColor: "#A89F9A", // Warm Muted Stone
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "AI Racik",
          headerTitle: "Share'N'Bite • AI Racik 🍳",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1.5 rounded-full ${
                focused ? "bg-[#FDEEE9]" : "bg-transparent"
              }`}
            >
              <Ionicons name="sparkles" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "Belanja",
          headerTitle: "Daftar Belanja Warung 🛒",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1.5 rounded-full ${
                focused ? "bg-[#FDEEE9]" : "bg-transparent"
              }`}
            >
              <Ionicons name="cart" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Buat Resep",
          headerTitle: "Resep Kreator 👨‍🍳",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1.5 rounded-full ${
                focused ? "bg-[#FEF3C7]" : "bg-transparent"
              }`}
            >
              <Ionicons name="add-circle" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Komunitas",
          headerTitle: "Komunitas Resep Anak Kos 🌐",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1.5 rounded-full ${
                focused ? "bg-[#E0F2FE]" : "bg-transparent"
              }`}
            >
              <Ionicons name="people" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cuan & Kos",
          headerTitle: "Finansial Kos & Level 📊",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1.5 rounded-full ${
                focused ? "bg-[#DCFCE7]" : "bg-transparent"
              }`}
            >
              <Ionicons name="stats-chart" size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
