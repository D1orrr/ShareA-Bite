import React from "react";
import { View } from "react-native";
import { Mascot } from "./art";
import { useTheme } from "./theme";
import { Txt } from "./Txt";

/** Shown while the app checks the server and restores the session. */
export function Splash() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: c.paper, minHeight: 300 }}>
      <Mascot size={110} mood="cook" />
      <Txt v="cap">Menyiapkan dapur...</Txt>
    </View>
  );
}
