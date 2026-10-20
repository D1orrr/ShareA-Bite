import React from "react";
import { Redirect, Tabs } from "expo-router";
import { AppHeader, AppTabBar } from "../../components/nav";
import { useTheme } from "../../components/theme";
import { Splash } from "../../components/Splash";
import { useStore } from "../../context/AppStore";

export const unstable_settings = { initialRouteName: "home" };

// The hidden screens live here too so they keep the header and tab bar.
export default function TabsLayout() {
  const { c } = useTheme();
  const { ready, user } = useStore();
  if (!ready) return <Splash />;
  if (!user) return <Redirect href="/" />;
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
