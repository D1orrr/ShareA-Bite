import "../global.css";
import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { useFonts } from "expo-font";
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
} from "@expo-google-fonts/be-vietnam-pro";
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ThemeProvider, useTheme } from "../components/theme";
import { OverlayProvider } from "../components/Overlay";
import { AppStoreProvider, ToastBridge } from "../context/AppStore";

// Without this, hidden tab screens on the web stay reachable with the Tab key.
if (Platform.OS === "web") enableScreens(true);

export default function RootLayout() {
  const [loaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    MaterialSymbolsOutlined: require("../assets/fonts/MaterialSymbolsOutlined.ttf"),
    MaterialSymbolsOutlinedFilled: require("../assets/fonts/MaterialSymbolsOutlined-Filled.ttf"),
  });

  // The web renders at once so the first render matches the pre-rendered HTML.
  if (!loaded && Platform.OS !== "web") return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppStoreProvider>
          <OverlayProvider>
            <ToastBridge />
            <RootStack />
          </OverlayProvider>
        </AppStoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { c, dark } = useTheme();
  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.paper } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboard" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="loading" options={{ animation: "fade" }} />
        <Stack.Screen name="cook/[id]" />
        <Stack.Screen name="finish/[id]" options={{ animation: "fade" }} />
      </Stack>
    </>
  );
}
