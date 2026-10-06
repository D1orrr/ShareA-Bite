import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FEF08A", // Soft yellow
          borderBottomWidth: 4,
          borderBottomColor: "#000000",
        },
        headerTitleStyle: {
          fontWeight: "900",
          fontSize: 18,
          color: "#000000",
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 4,
          borderTopColor: "#000000",
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 8,
          boxShadow: "0px -4px 0px 0px rgba(0,0,0,0.1)",
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#666666",
        tabBarLabelStyle: {
          fontWeight: "900",
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
              className={`p-1 rounded-md border-2 ${
                focused ? "bg-[#FEF08A] border-black" : "border-transparent"
              }`}
            >
              <Ionicons name="sparkles" size={20} color={focused ? "#000000" : color} />
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
              className={`p-1 rounded-md border-2 ${
                focused ? "bg-[#99F6E4] border-black" : "border-transparent"
              }`}
            >
              <Ionicons name="cart" size={20} color={focused ? "#000000" : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Buat Resep",
          headerTitle: "Recipe Creator Lab 👨‍🍳",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1 rounded-md border-2 ${
                focused ? "bg-[#FBCFE8] border-black" : "border-transparent"
              }`}
            >
              <Ionicons name="add-circle" size={22} color={focused ? "#000000" : color} />
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
              className={`p-1 rounded-md border-2 ${
                focused ? "bg-[#BAE6FD] border-black" : "border-transparent"
              }`}
            >
              <Ionicons name="people" size={20} color={focused ? "#000000" : color} />
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
              className={`p-1 rounded-md border-2 ${
                focused ? "bg-[#86EFAC] border-black" : "border-transparent"
              }`}
            >
              <Ionicons name="stats-chart" size={20} color={focused ? "#000000" : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
