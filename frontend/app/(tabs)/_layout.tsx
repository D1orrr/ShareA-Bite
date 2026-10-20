import React from "react";
import { Tabs } from "expo-router";
import { AppHeader, AppTabBar } from "../../components/nav";
import { useTheme } from "../../components/theme";

export const unstable_settings = { initialRouteName: "home" };

// The hidden screens live here too so they keep the header and tab bar.
export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      backBehavior="history"
      tabBar={props => <AppTabBar {...props} />}
      screenOptions={{
        header: ({ route }) => <AppHeader route={route.name} />,
        sceneStyle: { backgroundColor: c.paper },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="belanja" />
      <Tabs.Screen name="komunitas" />
      <Tabs.Screen name="akun" />
      <Tabs.Screen name="results" options={{ href: null }} />
      <Tabs.Screen name="recipe/[id]" options={{ href: null }} />
      <Tabs.Screen name="spots" options={{ href: null }} />
      <Tabs.Screen name="simpan" options={{ href: null }} />
    </Tabs>
  );
}
