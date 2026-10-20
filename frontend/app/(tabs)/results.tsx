import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { RecipeCard } from "../../components/cards";
import { useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import { between, Btn, Chip, Grid, row, Screen, wrap } from "../../components/ui";
import { RECIPES } from "../../constants/data";
import { rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

export default function Results() {
  const { c } = useTheme();
  const { budget } = useStore();
  return (
    <Screen>
      <View style={[row, between, wrap, { marginBottom: 18 }]}>
        <View>
          <Txt v="cap">Hasil untuk kamu</Txt>
          <Txt v="h1">
            Budget:{" "}
            <B m style={{ color: c.chili }}>
              {rp(budget)}
            </B>
          </Txt>
        </View>
        <Chip label="Edit budget" onPress={() => router.navigate("/home")} />
      </View>
      <Grid>
        {RECIPES.map(r => (
          <RecipeCard key={r.id} r={r} />
        ))}
      </Grid>
      <View style={[row, wrap, { marginTop: 24 }]}>
        <Btn ghost title="Ubah filter" onPress={() => router.navigate("/home")} />
        <Btn icon="auto_awesome" title="Regenerate" onPress={() => router.push("/loading")} />
      </View>
    </Screen>
  );
}
