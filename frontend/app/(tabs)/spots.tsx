import React from "react";
import { Platform, StyleSheet, TextStyle, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Icon } from "../../components/Icon";
import { goBack } from "../../components/nav";
import { useToast } from "../../components/Overlay";
import { useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import { Btn, Card, Chip, RoundBtn, row, Screen, Two, wrap } from "../../components/ui";
import { SPOT_FILTERS, SPOTS } from "../../constants/data";
import { fixed, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

const pinShadow = Platform.select<TextStyle>({
  web: { textShadow: "0 3px 3px rgba(0,0,0,0.3)" } as TextStyle,
  default: { textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 3 },
});

export default function Spots() {
  const { c } = useTheme();
  const toast = useToast();
  const { spot, toggleSpot } = useStore();
  const list = SPOTS.filter(s => spot.every(f => s.tags.includes(f)));

  return (
    <Screen>
      <View style={row}>
        <RoundBtn icon="arrow_back" label="Kembali" onPress={goBack} />
      </View>
      <View style={[row, wrap, { marginVertical: 16 }]}>
        {SPOT_FILTERS.map(f => (
          <Chip key={f} kind="checkbox" label={f} on={spot.includes(f)} onPress={() => toggleSpot(f)} />
        ))}
      </View>
      <Two r>
        <View
          role="img"
          aria-label={`Peta ${list.length} tempat murah di sekitar kamu`}
          style={{ height: 360, borderRadius: 12, overflow: "hidden", boxShadow: `0 1px 3px ${c.sh}` }}
        >
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="mapbg" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#d4efe0" />
                <Stop offset="0.55" stopColor="#eef0ff" />
                <Stop offset="1" stopColor="#d7e6f4" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#mapbg)" />
            {/* Two roads */}
            <Rect x="46%" width="4%" height="100%" fill="#ffffff" opacity={0.6} />
            <Rect y="38%" width="100%" height="4%" fill="#ffffff" opacity={0.6} />
          </Svg>
          {SPOTS.map((s, i) => (
            <View key={s.name} style={{ position: "absolute", left: `${22 + i * 22}%`, top: `${28 + (i % 2) * 34}%` }}>
              <Icon
                name="location_on"
                size={42}
                fill
                color={list.includes(s) ? c.chili : fixed.pinOff}
                style={pinShadow}
              />
            </View>
          ))}
          <View
            style={{
              position: "absolute",
              left: "44%",
              top: "50%",
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: fixed.you,
              borderWidth: 3,
              borderColor: "#ffffff",
            }}
          />
        </View>
        <View style={{ gap: 14 }}>
          {list.length ? (
            list.map(s => (
              <Card key={s.name} style={row}>
                <View style={{ flex: 1 }}>
                  <Txt>
                    <B>{s.name}</B>
                  </Txt>
                  <Txt v="cap">
                    {s.distance}, buka {s.hours}
                  </Txt>
                  <View style={[row, wrap, { gap: 12, marginTop: 4 }]}>
                    <Txt b m color={c.chili}>
                      ±{rp(s.price)}
                    </Txt>
                    <Txt v="cap">Rating mahasiswa {s.rating}/5</Txt>
                  </View>
                </View>
                <Btn size="s" title="Buka Maps" onPress={() => toast("Membuka Google Maps")} />
              </Card>
            ))
          ) : (
            <Card>
              <Txt v="cap">Belum ada tempat yang cocok. Kurangi filter.</Txt>
            </Card>
          )}
        </View>
      </Two>
    </Screen>
  );
}
