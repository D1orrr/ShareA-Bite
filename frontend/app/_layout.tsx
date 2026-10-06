import "../global.css";
import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppProvider } from "../context/AppContext";
import colors from "../constants/colors";

export default function RootLayout() {
  // Registers the icon font during the web static render too. Without it the
  // server HTML has empty icons and React reports a hydration mismatch.
  if (Platform.OS === "web") {
    Ionicons.loadFont().catch(() => {});
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.cream,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
