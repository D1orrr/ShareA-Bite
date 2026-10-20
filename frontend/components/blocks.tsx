/** Composite cards used across screens. */
import React from "react";
import { Image, Linking, Pressable, Share, View } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { getRecipe, Post, Recipe, Spot } from "../data/seed";
import { cost, R } from "../lib/format";
import { C, useT } from "../theme";
import { FoodPlate } from "./art";
import { Avatar, Btn, Card, Col, Icon, IconBtn, Ring, Row, Stamp, Txt } from "./ui";

/** Dark translucent price tag pinned on images (`.pr`). */
export function PricePill({ label }: { label: string }) {
  return (
    <View
      style={{
        position: "absolute",
        left: 12,
        bottom: 12,
        backgroundColor: C.pricePill,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      }}
    >
      <Icon n="payments" size={16} c={C.mint} />
      <Txt f="jk6" s={12} c={C.pricePillInk} num>
        {label}
      </Txt>
    </View>
  );
}

/** Recipe result card (`.rc`). */
export function RecipeCard({ r }: { r: Recipe }) {
  const t = useT();
  const router = useRouter();
  const { budget, saved, toggleSaved } = useApp();
  const c = cost(r);
  const ok = c <= budget;
  return (
    <Pressable
      onPress={() => router.push(`/recipe/${r.id}`)}
      accessibilityRole="link"
      accessibilityLabel={r.title}
      style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => ({
        backgroundColor: t.card,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: hovered ? `0 14px 30px -14px ${t.sh}` : `0 1px 3px ${t.sh}`,
        transform: [{ translateY: hovered ? -3 : 0 }, { scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View>
        <FoodPlate dish={r.id} color={r.color} height={200} radius={0} />
        <PricePill label={R(c)} />
        <IconBtn
          n="heart"
          fill={saved.includes(r.id)}
          c="sec"
          bg="rgba(255,255,255,0.92)"
          label="Simpan resep"
          onPress={() => toggleSaved(r.id)}
          style={{ position: "absolute", top: 12, right: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
        />
      </View>
      <Col gap={8} style={{ padding: 16 }}>
        <Txt v="h3" s={21}>
          {r.title}
        </Txt>
        <Txt v="cap" num>
          {r.minutes} mnt, {r.kcal} kkal, {r.protein} g protein
        </Txt>
        <Row sp>
          <Stamp label={ok ? "SISA " + R(budget - c) : "LEWAT " + R(c - budget)} bad={!ok} />
          <Ring p={r.score} />
        </Row>
      </Col>
    </Pressable>
  );
}

/** Community post card. */
export function PostCard({ p }: { p: Post }) {
  const t = useT();
  const router = useRouter();
  const { liked, toggleLiked, toast } = useApp();
  const isLiked = liked.includes(p.id);
  const isSaved = liked.includes("b" + p.id);
  const share = async () => {
    try {
      await Share.share({ message: `${p.title} — via ShareA'Bite` });
    } catch {
      toast("Link disalin");
    }
  };
  const priceLabel = p.cost ? `Total ${R(p.cost)}${p.type === "Resep" ? " / 2 porsi" : ""}` : "";
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <Row sp style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
        <Row>
          <Avatar letter={p.author[0]} size={40} />
          <View>
            <Row gap={6}>
              <Txt f="jk7" s={14}>
                {p.author}
              </Txt>
              <Stamp label={p.campus} color="chili" bg={t.sirup} style={{ paddingVertical: 2, paddingHorizontal: 8 }} />
            </Row>
            <Txt v="cap">{p.time}</Txt>
          </View>
        </Row>
        {p.type !== "Resep" ? <Stamp label={p.type} color="chili" bg={t.sirup} /> : null}
      </Row>

      {p.imageUri ? (
        <View style={{ marginTop: 8 }}>
          <Image source={{ uri: p.imageUri }} style={{ width: "100%", height: 210 }} resizeMode="cover" />
          {priceLabel ? <PricePill label={priceLabel} /> : null}
        </View>
      ) : p.recipeId ? (
        <Pressable style={{ marginTop: 8 }} onPress={() => router.push(`/recipe/${p.recipeId}`)}>
          <FoodPlate dish={p.recipeId} color={getRecipe(p.recipeId).color} height={210} radius={0} />
          {priceLabel ? <PricePill label={priceLabel} /> : null}
        </Pressable>
      ) : null}

      <Col gap={10} style={{ padding: 16 }}>
        <Txt v="h3" style={{ lineHeight: 23 }}>
          {p.title}
        </Txt>
        {p.body ? <Txt c="mut">{p.body}</Txt> : null}

        {p.location ? (
          <Row sp style={{ backgroundColor: t.sirup, borderRadius: 8, padding: 10 }}>
            <Row gap={6} style={{ flex: 1, minWidth: 0 }}>
              <Icon n="pin" c="sec" />
              <Txt f="jk6" s={12.5} numberOfLines={1} style={{ flex: 1 }}>
                {p.location}
              </Txt>
            </Row>
            <Pressable onPress={() => router.push("/spots")} accessibilityRole="link">
              <Txt f="jk7" s={11} c="chili">
                Lihat Rute
              </Txt>
            </Pressable>
          </Row>
        ) : null}

        {p.perPortion ? (
          <Row>
            {[
              ["Waktu Masak", p.cookTime, "ink"],
              ["Budget Porsi", p.perPortion, "chili"],
            ].map(([k, v, c]) => (
              <View key={k} style={{ flex: 1, backgroundColor: t.sirup, borderRadius: 8, padding: 8, alignItems: "center" }}>
                <Txt v="cap" s={12}>
                  {k}
                </Txt>
                <Txt f="jk7" s={12.5} c={c}>
                  {v}
                </Txt>
              </View>
            ))}
          </Row>
        ) : null}

        <Row sp>
          <Row gap={14}>
            <Pressable onPress={() => toggleLiked(p.id)} accessibilityLabel="Suka" style={{ flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44 }}>
              <Icon n="heart" fill={isLiked} c={isLiked ? "sec" : "mut"} />
              <Txt f="vn7" s={12} c={isLiked ? "sec" : "mut"}>
                {p.likes + (isLiked ? 1 : 0)}
              </Txt>
            </Pressable>
            <Row gap={4}>
              <Icon n="msg" c="mut" />
              <Txt f="vn7" s={12} c="mut">
                {p.comments}
              </Txt>
            </Row>
            <IconBtn n="share" label="Bagikan" onPress={share} />
          </Row>
          <IconBtn n="bookmark" fill={isSaved} c={isSaved ? "chili" : "mut"} label="Simpan" onPress={() => toggleLiked("b" + p.id)} />
        </Row>
      </Col>
    </Card>
  );
}

/** Cheap-food spot row. */
export function SpotCard({ s }: { s: Spot }) {
  const { toast } = useApp();
  const open = () => {
    toast("Membuka Google Maps");
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + " Depok")}`).catch(() => {});
  };
  return (
    <Card>
      <Row>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt f="vn7">{s.name}</Txt>
          <Txt v="cap">
            {s.distance}, buka {s.hours}
          </Txt>
          <Row wrap gap={12} style={{ marginTop: 4 }}>
            <Txt f="jk7" c="chili" num>
              ±{R(s.price)}
            </Txt>
            <Txt v="cap">Rating mahasiswa {s.rating}/5</Txt>
          </Row>
        </View>
        <Btn size="s" title="Buka Maps" onPress={open} />
      </Row>
    </Card>
  );
}
