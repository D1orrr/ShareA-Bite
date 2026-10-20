import React from "react";
import { Tabs } from "expo-router";
import { TabBar, TopBar } from "../../components/chrome";
import { useT } from "../../theme";

/**
 * Main app shell: sticky top bar + bottom tab bar (mobile) / top nav (desktop).
 * Screens with `href: null` live inside the shell but have no tab of their own.
 */
export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs
      initialRouteName="home"
      tabBar={() => <TabBar />}
      screenOptions={{ header: () => <TopBar />, sceneStyle: { backgroundColor: t.paper } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="belanja" />
      <Tabs.Screen name="komunitas" />
      <Tabs.Screen name="akun" />
      <Tabs.Screen name="results" options={{ href: null }} />
      <Tabs.Screen name="recipe/[id]" options={{ href: null }} />
      <Tabs.Screen name="simpan" options={{ href: null }} />
      <Tabs.Screen name="spots" options={{ href: null }} />
    </Tabs>
  );
}
