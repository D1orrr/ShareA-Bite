import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { RecipeCard } from "../../components/blocks";
import { Btn, Chip, Grid, Row, Screen, Txt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { RECIPES } from "../../data/seed";
import { R } from "../../lib/format";

export default function Results() {
  const router = useRouter();
  const { budget } = useApp();
  return (
    <Screen>
      <Row sp wrap style={{ marginBottom: 18 }}>
        <View>
          <Txt v="cap">Hasil untuk kamu</Txt>
          <Txt v="h1" accessibilityRole="header">
            Budget:{" "}
            <Txt v="h1" c="chili" num>
              {R(budget)}
            </Txt>
          </Txt>
        </View>
        <Chip label="Edit budget" onPress={() => router.navigate("/home")} />
      </Row>
      <Grid>
        {RECIPES.map((r) => (
          <RecipeCard key={r.id} r={r} />
        ))}
      </Grid>
      <Row wrap style={{ marginTop: 24 }}>
        <Btn ghost title="Ubah filter" onPress={() => router.navigate("/home")} />
        <Btn icon="spark" title="Regenerate" onPress={() => router.push("/loading")} />
      </Row>
    </Screen>
  );
}
