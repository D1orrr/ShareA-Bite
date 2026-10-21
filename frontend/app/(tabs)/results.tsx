import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { RecipeCard } from "../../components/cards";
import { useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import { between, Btn, Chip, Grid, row, Screen, Sticky, wrap } from "../../components/ui";
import { Mascot } from "../../components/art";
import { rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

export default function Results() {
  const { c } = useTheme();
  const { budget, results } = useStore();
  const list = results?.recipes ?? [];
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
      {results?.note ? <Sticky style={{ marginBottom: 16 }}>{results.note}</Sticky> : null}
      {list.length ? (
        <Grid>
          {list.map(r => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </Grid>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
          <Mascot size={130} mood="err" />
          <Txt v="h2">Belum ada hasil</Txt>
          <Txt v="cap">Atur budget di Explore lalu tekan Generate.</Txt>
        </View>
      )}
      {results?.engine === "gemini" ? (
        <Txt v="cap" style={{ marginTop: 12 }}>
          Dibuat dengan AI, harga dihitung ulang dari tabel harga bahan.
        </Txt>
      ) : null}
      <View style={[row, wrap, { marginTop: 24 }]}>
        <Btn ghost title="Ubah filter" onPress={() => router.navigate("/home")} />
        <Btn icon="auto_awesome" title="Regenerate" onPress={() => router.push("/loading")} />
      </View>
    </Screen>
  );
}
