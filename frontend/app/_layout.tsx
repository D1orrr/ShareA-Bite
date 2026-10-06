import "../global.css";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FEF08A", // Neo-brutalist pastel yellow
          },
          headerTintColor: "#000000",
          headerTitleStyle: {
            fontWeight: "900",
            fontSize: 20,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#FBF9F1", // Soft cream neo-brutalist background
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Share'N'Bite 🍳",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
