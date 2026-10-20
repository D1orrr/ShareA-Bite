import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Mascot } from "../../components/art";
import { RecipeCard } from "../../components/cards";
import { Txt } from "../../components/Txt";
import { Btn, Grid, Screen } from "../../components/ui";
import { useStore } from "../../context/AppStore";

export default function Simpan() {
  const { savedRecipes: list } = useStore();
  return (
    <Screen>
      {list.length ? (
        <Grid>
          {list.map(r => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </Grid>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 50, gap: 14 }}>
          <Mascot size={150} mood="err" />
          <Txt v="h2" style={{ textAlign: "center" }}>
            Belum ada resep tersimpan
          </Txt>
          <Txt v="cap" style={{ textAlign: "center" }}>
            Tap hati di resep untuk menyimpannya.
          </Txt>
          <Btn title="Cari resep" onPress={() => router.navigate("/home")} />
        </View>
      )}
    </Screen>
  );
}
