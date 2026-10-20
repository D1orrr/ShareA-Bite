import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from "@expo-google-fonts/be-vietnam-pro";
import { AppProvider } from "../context/AppContext";
import { ThemeProvider, useTheme } from "../theme";

function Root() {
  const { t, isDark } = useTheme();
  return (
    <AppProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.paper } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboard" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="loading" options={{ animation: "fade" }} />
        <Stack.Screen name="cook/[id]" />
        <Stack.Screen name="finish/[id]" options={{ animation: "fade" }} />
      </Stack>
    </AppProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });
  // Render nothing until mounted on the client: layout depends on window size,
  // so this keeps the static-rendered HTML and first client render identical.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!loaded || !mounted) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
