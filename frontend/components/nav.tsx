import React from "react";
import { Pressable, Text, View } from "react-native";
import { Link, router, Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { fixed, font } from "../constants/theme";
import { useStore } from "../context/AppStore";
import { Mascot } from "./art";
import { Icon, IconName } from "./Icon";
import { useToast } from "./Overlay";
import { useLayout, useTheme } from "./theme";

type TabKey = "home" | "belanja" | "komunitas" | "akun";

export const NAV: { key: TabKey; label: string; href: Href; icon: IconName }[] = [
  { key: "home", label: "Explore", href: "/home", icon: "explore" },
  { key: "belanja", label: "Daftar Belanja", href: "/belanja", icon: "shopping_bag" },
  { key: "komunitas", label: "Komunitas", href: "/komunitas", icon: "forum" },
  { key: "akun", label: "Profil", href: "/akun", icon: "account_circle" },
];

const TITLES: Record<string, string> = {
  home: "Explore",
  results: "Hasil Resep",
  "recipe/[id]": "Detail Resep",
  simpan: "Simpan",
  belanja: "Daftar Belanja",
  komunitas: "Komunitas",
  spots: "Tempat Murah",
  akun: "Profil",
};

// Which tab is lit for each screen, including the ones not in the tab bar.
function tabOf(route: string): TabKey {
  if (route === "results" || route === "recipe/[id]") return "home";
  if (route === "spots") return "belanja";
  if (route === "simpan") return "akun";
  return route as TabKey;
}

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate("/home");
}

export function AppHeader({ route }: { route: string }) {
  const { c } = useTheme();
  const { wide } = useLayout();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useStore();
  const tab = tabOf(route);
  const initial = user && !user.is_guest ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: c.paper,
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        zIndex: 40,
      }}
    >
      <View
        style={{
          height: 64,
          paddingHorizontal: wide ? 48 : 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
          <Mascot size={34} />
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontFamily: font.headSemi, fontSize: 12, lineHeight: 14, letterSpacing: 0.24, color: c.chili }}>
              ShareA’Bite
            </Text>
            <Text
              role="heading"
              numberOfLines={1}
              style={{ fontFamily: font.headSemi, fontSize: 20, lineHeight: 24, letterSpacing: -0.2, color: c.ink }}
            >
              {TITLES[route] ?? ""}
            </Text>
          </View>
        </View>

        {wide ? (
          <View role="navigation" aria-label="Main" style={{ flexDirection: "row", gap: 4 }}>
            {NAV.map(n => {
              const on = n.key === tab;
              return (
                <Link key={n.key} href={n.href} asChild>
                  <Pressable
                    role="link"
                    aria-label={n.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      minHeight: 44,
                      paddingHorizontal: 16,
                      borderRadius: 99,
                      backgroundColor: on ? c.chili : "transparent",
                    }}
                  >
                    <Icon name={n.icon} size={20} fill={on} color={on ? c.onp : c.mut} />
                    <Text style={{ fontFamily: font.headSemi, fontSize: 14, color: on ? c.onp : c.mut }}>{n.label}</Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Pressable
            role="button"
            aria-label="Notifikasi"
            onPress={() => toast("Belum ada notifikasi baru")}
            style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}
          >
            <Icon name="notifications" color={c.mut} />
          </Pressable>
          <Link href="/akun" asChild>
            <Pressable
              role="link"
              aria-label="Profil"
              hitSlop={4}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: fixed.avatar,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: font.head, fontSize: 14, color: fixed.avatarInk }}>{initial}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

export function AppTabBar({ state }: BottomTabBarProps) {
  const { c } = useTheme();
  const { wide, w } = useLayout();
  const insets = useSafeAreaInsets();
  const { cart } = useStore();
  if (wide) return null;

  const tab = tabOf(state.routes[state.index].name);
  const open = cart.filter(x => !x.done).length;

  return (
    <View
      role="navigation"
      aria-label="Main"
      style={{
        height: 64 + insets.bottom,
        paddingBottom: insets.bottom,
        // Less side padding on phones under 400px so "Daftar Belanja" fits.
        paddingHorizontal: w < 400 ? 4 : 16,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: c.paper,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {NAV.map(n => {
        const on = n.key === tab;
        const color = on ? c.chili : c.mut;
        return (
          <Link key={n.key} href={n.href} asChild>
            <Pressable
              role="link"
              aria-label={n.key === "belanja" && open ? `${n.label}, ${open} belum dibeli` : n.label}
              style={{ flex: 1, maxWidth: 120, alignItems: "center", justifyContent: "center", gap: 2 }}
            >
              <View>
                <Icon name={n.icon} size={24} fill={on} color={color} />
                {n.key === "belanja" && open ? (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -9,
                      backgroundColor: c.sec,
                      borderRadius: 99,
                      paddingVertical: 3,
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text style={{ fontFamily: font.head, fontSize: 10, lineHeight: 10, color: c.ons }}>{open}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={{
                  fontFamily: font.head,
                  fontSize: 11,
                  lineHeight: 13,
                  letterSpacing: 0.33,
                  color,
                  textAlign: "center",
                }}
              >
                {n.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
