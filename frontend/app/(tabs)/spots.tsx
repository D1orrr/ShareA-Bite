import React, { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, TextStyle, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Icon } from "../../components/Icon";
import { goBack } from "../../components/nav";
import { useToast } from "../../components/Overlay";
import { useTheme } from "../../components/theme";
import { B, Txt } from "../../components/Txt";
import { Btn, Card, Chip, RoundBtn, row, Screen, Two, wrap } from "../../components/ui";
import { Spot, SPOT_FILTERS } from "../../constants/data";
import { fixed, rp } from "../../constants/theme";
import { useStore } from "../../context/AppStore";

const pinShadow = Platform.select<TextStyle>({
  web: { textShadow: "0 3px 3px rgba(0,0,0,0.3)" } as TextStyle,
  default: { textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 3 },
});

export default function Spots() {
  const { c } = useTheme();
  const toast = useToast();
  const { spot, toggleSpot, fetchSpots } = useStore();
  const [all, setAll] = useState<Spot[]>([]);
  const [found, setFound] = useState<Spot[] | null>(null);
  useEffect(() => {
    fetchSpots([]).then(setAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // "Buka sekarang" is worked out by the server from the current time (WIB)
  useEffect(() => {
    let alive = true;
    setFound(null);
    fetchSpots(spot).then(l => alive && setFound(l));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot.join(",")]);
  const list = found ?? [];
  const isFound = (s: Spot) => list.some(x => (x.id ?? x.name) === (s.id ?? s.name));
  const openMaps = (s: Spot) => {
    toast("Membuka Google Maps");
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} Depok`)}`).catch(() => {});
  };

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
          {all.map((s, i) => (
            <View key={s.id ?? s.name} style={{ position: "absolute", left: `${12 + ((i * 19) % 76)}%`, top: `${18 + (i % 3) * 26}%` }}>
              <Icon
                name="location_on"
                size={42}
                fill
                color={isFound(s) ? c.chili : fixed.pinOff}
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
          {found === null ? (
            <Txt v="cap">Mencari tempat...</Txt>
          ) : list.length ? (
            list.map(s => (
              <Card key={s.id ?? s.name} style={row}>
                <View style={{ flex: 1 }}>
                  <Txt>
                    <B>{s.name}</B>
                  </Txt>
                  <Txt v="cap">
                    {s.distance}, buka {s.hours}
                    {s.openNow === false ? " · tutup sekarang" : ""}
                  </Txt>
                  <View style={[row, wrap, { gap: 12, marginTop: 4 }]}>
                    <Txt b m color={c.chili}>
                      ±{rp(s.price)}
                    </Txt>
                    <Txt v="cap">Rating mahasiswa {s.rating}/5</Txt>
                  </View>
                </View>
                <Btn size="s" title="Buka Maps" onPress={() => openMaps(s)} />
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
