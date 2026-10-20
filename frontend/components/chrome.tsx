/** App chrome: sticky top bar (with desktop nav) and mobile bottom tab bar. */
import React from "react";
import { Pressable, View } from "react-native";
import { Href, useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { MAX_W, useLayout, useT } from "../theme";
import { Mascot } from "./art";
import { Avatar, Icon, IconBtn, IconName, Txt } from "./ui";

type TabKey = "home" | "belanja" | "komunitas" | "akun";

export const NAV: { key: TabKey; icon: IconName; label: string; href: Href }[] = [
  { key: "home", icon: "home", label: "Explore", href: "/home" },
  { key: "belanja", icon: "cart", label: "Daftar Belanja", href: "/belanja" },
  { key: "komunitas", icon: "users", label: "Komunitas", href: "/komunitas" },
  { key: "akun", icon: "user", label: "Profil", href: "/akun" },
];

const TITLES: Record<string, string> = {
  home: "Explore",
  results: "Hasil Resep",
  recipe: "Detail Resep",
  simpan: "Simpan",
  belanja: "Daftar Belanja",
  komunitas: "Komunitas",
  spots: "Tempat Murah",
  akun: "Profil",
};

/** Which tab is highlighted for each screen. */
const TAB_OF: Record<string, TabKey> = {
  home: "home",
  results: "home",
  recipe: "home",
  spots: "belanja",
  belanja: "belanja",
  komunitas: "komunitas",
  simpan: "akun",
  akun: "akun",
};

function useCurrent() {
  const segs = useSegments() as string[];
  const key = segs[1] ?? "home";
  return { key, title: TITLES[key] ?? "", tab: TAB_OF[key] ?? "home" };
}

export function TopBar() {
  const t = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wide } = useLayout();
  const { guest, toast } = useApp();
  const { title, tab } = useCurrent();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: t.paperA, boxShadow: "0 1px 8px rgba(0,0,0,0.04)", zIndex: 40 }}>
    {/* Inner row shares the page's max width so logo/avatar line up with the content */}
    <View
      style={{
        height: 64,
        width: "100%",
        maxWidth: MAX_W,
        alignSelf: "center",
        paddingHorizontal: wide ? 48 : 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Mascot size={34} still />
        <View>
          <Txt f="jk6" s={12} c="chili" style={{ lineHeight: 14, letterSpacing: 0.24 }}>
            ShareA’Bite
          </Txt>
          <Txt f="jk6" s={20} style={{ lineHeight: 24, letterSpacing: -0.2 }}>
            {title}
          </Txt>
        </View>
      </View>

      {wide ? (
        <View style={{ flexDirection: "row", gap: 4 }}>
          {NAV.map((n) => {
            const on = n.key === tab;
            return (
              <Pressable
                key={n.key}
                onPress={() => router.navigate(n.href)}
                accessibilityRole="link"
                style={(state) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  paddingHorizontal: 16,
                  borderRadius: 99,
                  backgroundColor: on ? t.chili : (state as { hovered?: boolean }).hovered ? t.sirup : "transparent",
                })}
              >
                <Icon n={n.icon} fill={on} size={20} c={on ? "onp" : "mut"} />
                <Txt f="jk6" s={14} c={on ? "onp" : "mut"}>
                  {n.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <IconBtn n="bell" label="Notifikasi" onPress={() => toast("Belum ada notifikasi baru")} />
        <Pressable onPress={() => router.navigate("/akun")} accessibilityLabel="Profil">
          <Avatar letter={guest ? "?" : "D"} size={36} />
        </Pressable>
      </View>
    </View>
    </View>
  );
}

export function TabBar() {
  const t = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wide } = useLayout();
  const { cart } = useApp();
  const { tab } = useCurrent();
  if (wide) return null;
  const open = cart.filter((x) => !x.done).length;
  return (
    <View
      accessibilityRole="tablist"
      style={{
        height: 64 + insets.bottom,
        paddingBottom: insets.bottom,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: t.paperA,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {NAV.map((n) => {
        const on = n.key === tab;
        return (
          <Pressable
            key={n.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => router.navigate(n.href)}
            style={{ flex: 1, maxWidth: 120, alignItems: "center", justifyContent: "center", gap: 2 }}
          >
            <View>
              <Icon n={n.icon} fill={on} size={24} c={on ? "chili" : "mut"} />
              {n.key === "belanja" && open ? (
                <View style={{ position: "absolute", top: -4, right: -9, backgroundColor: t.sec, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Txt f="jk7" s={10} c="ons" style={{ lineHeight: 12 }}>
                    {open}
                  </Txt>
                </View>
              ) : null}
            </View>
            <Txt f="jk7" s={11} c={on ? "chili" : "mut"} numberOfLines={1} style={{ letterSpacing: 0.3 }}>
              {n.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
