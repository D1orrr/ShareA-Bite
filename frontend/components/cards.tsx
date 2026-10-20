import React from "react";
import { Image, Pressable, Share, Text, View } from "react-native";
import { Link } from "expo-router";
import { Post, Recipe, recipeById, recipeCost, recipePay } from "../constants/data";
import { assetUrl } from "../lib/api";
import { CommentsSheet } from "./CommentsSheet";
import { fixed, font, rp } from "../constants/theme";
import { useStore } from "../context/AppStore";
import { FoodPhoto } from "./art";
import { Icon } from "./Icon";
import { useSheet, useToast } from "./Overlay";
import { useTheme } from "./theme";
import { Txt } from "./Txt";
import { Avatar, between, Card, Ring, row, Stamp } from "./ui";

export function PriceTag({ text }: { text: string }) {
  return (
    <View
      style={{
        position: "absolute",
        left: 12,
        bottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: fixed.priceBg,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 8,
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      }}
    >
      <Icon name="payments" size={16} color={fixed.priceIcon} />
      <Text style={{ fontFamily: font.headSemi, fontSize: 12, color: fixed.priceInk }}>{text}</Text>
    </View>
  );
}

export function useSaveRecipe() {
  const { toggleSaved } = useStore();
  const toast = useToast();
  return (id: number) => toast(toggleSaved(id) ? "Tersimpan. Hemat banget!" : "Dihapus dari Simpan");
}

export function RecipeCard({ r }: { r: Recipe }) {
  const { c } = useTheme();
  const { budget, saved } = useStore();
  const save = useSaveRecipe();
  // What the user pays (the generator may leave out staples with "Bahan ada")
  const cost = recipePay(r);
  const ok = cost <= budget;
  const isSaved = saved.includes(r.id);
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: c.card,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `0 1px 3px ${c.sh}`,
      }}
    >
      <Link href={`/recipe/${r.id}`} asChild>
        <Pressable role="link" aria-label={r.title}>
          <FoodPhoto art={r.art ?? r.id} color={r.color} height={200} radius={0} />
          <PriceTag text={rp(cost)} />
        </Pressable>
      </Link>
      <Pressable
        role="button"
        aria-label={isSaved ? "Hapus dari Simpan" : "Simpan resep"}
        onPress={() => save(r.id)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: fixed.saveBg,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Icon name="favorite" fill={isSaved} color={c.sec} />
      </Pressable>
      <View style={{ padding: 16, gap: 8 }}>
        <Txt v="h3" style={{ fontSize: 21, lineHeight: 25 }}>
          {r.title}
        </Txt>
        <Txt v="cap" m>
          {r.min} mnt, {r.cal} kkal, {r.pro} g protein
        </Txt>
        <View style={[row, between]}>
          <Stamp bad={!ok} label={ok ? "SISA " + rp(budget - cost) : "LEWAT " + rp(cost - budget)} />
          <Ring p={r.score} />
        </View>
      </View>
    </View>
  );
}

const iconBtn = { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" } as const;

export function PostCard({ p }: { p: Post }) {
  const { c } = useTheme();
  const { toggleLike, toggleBookmark, cachedRecipe } = useStore();
  const toast = useToast();
  const { openSheet, closeSheet } = useSheet();
  const isLiked = !!p.liked;
  const bookmarked = !!p.saved;
  const linked = p.recipeId ? cachedRecipe(p.recipeId) ?? (p.recipeId <= 3 ? recipeById(p.recipeId) : undefined) : undefined;
  const img = assetUrl(p.imageUrl);
  const priceText = p.cost ? `Total ${rp(p.cost)}${p.type === "Resep" ? " / 2 porsi" : ""}` : "";
  const share = async () => {
    try {
      await Share.share({ message: `${p.title} — via ShareA'Bite` });
    } catch {
      toast("Link disalin");
    }
  };
  const tint = { bg: c.sirup, color: c.chili };

  return (
    <Card style={{ padding: 0, overflow: "hidden", flexGrow: 1 }}>
      <View style={[row, between, { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 4 }]}>
        <View style={[row, { flexShrink: 1 }]}>
          <Avatar label={p.name[0]} size={40} fontSize={15} />
          <View style={{ flexShrink: 1 }}>
            <View style={[row, { gap: 6, flexWrap: "wrap" }]}>
              <Text style={{ fontFamily: font.head, fontSize: 14, color: c.ink }}>{p.name}</Text>
              <Stamp label={p.campus} bg={tint.bg} color={tint.color} style={{ paddingVertical: 2, paddingHorizontal: 8 }} />
            </View>
            <Txt v="cap">{p.time}</Txt>
          </View>
        </View>
        {p.type !== "Resep" ? <Stamp label={p.type} bg={tint.bg} color={tint.color} /> : null}
      </View>

      {img ? (
        <View style={{ marginTop: 8 }}>
          <Image source={{ uri: img }} style={{ width: "100%", height: 210 }} resizeMode="cover" accessibilityLabel={p.title} />
          {priceText ? <PriceTag text={priceText} /> : null}
        </View>
      ) : p.recipeId ? (
        <Link href={`/recipe/${p.recipeId}`} asChild>
          <Pressable role="link" aria-label={`Lihat resep: ${p.title}`} style={{ marginTop: 8 }}>
            <FoodPhoto art={linked?.art ?? (p.recipeId <= 3 ? p.recipeId : 2)} color={linked?.color ?? "#7FBF8F"} height={210} radius={0} />
            {priceText ? <PriceTag text={priceText} /> : null}
          </Pressable>
        </Link>
      ) : null}

      <View style={{ padding: 16, gap: 10 }}>
        <Txt v="h3" role="heading" style={{ lineHeight: 23 }}>
          {p.title}
        </Txt>
        {p.text ? <Txt color={c.mut}>{p.text}</Txt> : null}
        {!img && !p.recipeId && priceText ? (
          <Txt b m color={c.chili}>
            {priceText}
          </Txt>
        ) : null}

        {p.loc ? (
          <View style={[row, between, { backgroundColor: c.sirup, borderRadius: 8, padding: 10 }]}>
            <View style={[row, { gap: 6, flexShrink: 1 }]}>
              <Icon name="pin_drop" color={c.sec} />
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.headSemi, fontSize: 12.5, color: c.ink }}>
                {p.loc}
              </Text>
            </View>
            <Link
              href="/spots"
              style={{ flexShrink: 0, fontFamily: font.head, fontSize: 11, color: c.chili, textDecorationLine: "underline" }}
            >
              Lihat Rute
            </Link>
          </View>
        ) : null}

        {p.perPortion || p.cookTime ? (
          <View style={row}>
            {[
              ["Waktu Masak", p.cookTime, c.ink],
              ["Budget Porsi", p.perPortion, c.chili],
            ].filter(([, v]) => v).map(([k, v, color]) => (
              <View key={k} style={{ flex: 1, backgroundColor: c.sirup, borderRadius: 8, padding: 8, alignItems: "center" }}>
                <Txt v="cap" style={{ fontSize: 12, lineHeight: 18 }}>
                  {k}
                </Txt>
                <Text style={{ fontFamily: font.head, fontSize: 12.5, color }}>{v}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[row, between]}>
          <View style={[row, { gap: 14 }]}>
            <Pressable
              role="button"
              aria-label={isLiked ? "Batal suka" : "Suka"}
              onPress={() => toggleLike(p.key)}
              style={[row, { gap: 4, minHeight: 44 }]}
            >
              <Icon name="favorite" fill={isLiked} color={isLiked ? c.sec : c.mut} />
              <Txt v="cap" b color={isLiked ? c.sec : c.mut} style={{ fontSize: 12 }}>
                {p.likes}
              </Txt>
            </Pressable>
            <Pressable
              role="button"
              aria-label={`${p.comments} komentar, buka komentar`}
              onPress={() => openSheet(<CommentsSheet postKey={p.key} title={p.title} onClose={closeSheet} />)}
              style={[row, { gap: 4, minHeight: 44 }]}
            >
              <Icon name="chat_bubble" color={c.mut} />
              <Txt v="cap" b style={{ fontSize: 12 }}>
                {p.comments}
              </Txt>
            </Pressable>
            <Pressable role="button" aria-label="Bagikan" onPress={share} style={iconBtn}>
              <Icon name="share" color={c.mut} />
            </Pressable>
          </View>
          <Pressable
            role="button"
            aria-label={bookmarked ? "Hapus simpanan" : "Simpan"}
            onPress={() => toggleBookmark(p.key)}
            style={iconBtn}
          >
            <Icon name="bookmark" fill={bookmarked} color={bookmarked ? c.chili : c.mut} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

