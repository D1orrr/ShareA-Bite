import React from "react";
import { useRouter } from "expo-router";
import { Mascot } from "../../components/art";
import { RecipeCard } from "../../components/blocks";
import { Btn, Col, Grid, Screen, Txt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { RECIPES } from "../../data/seed";

export default function Simpan() {
  const router = useRouter();
  const { saved } = useApp();
  const list = RECIPES.filter((r) => saved.includes(r.id));
  return (
    <Screen>
      {list.length ? (
        <Grid>
          {list.map((r) => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </Grid>
      ) : (
        <Col style={{ alignItems: "center", paddingVertical: 50 }}>
          <Mascot size={150} mood="err" />
          <Txt v="h2">Belum ada resep tersimpan</Txt>
          <Txt v="cap">Tap hati di resep untuk menyimpannya.</Txt>
          <Btn title="Cari resep" onPress={() => router.navigate("/home")} />
        </Col>
      )}
    </Screen>
  );
}
