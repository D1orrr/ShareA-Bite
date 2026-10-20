/** Illustrations: Si Mangkok mascot and the flat food-plate artwork. */
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleProp, View, ViewStyle } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { useSvgId } from "./ui";

const ND = Platform.OS !== "web";
type Mood = "idle" | "cook" | "cheer" | "err";

/** Si Mangkok — the bowl mascot. `cook` stirs, everything else gently bobs. */
export function Mascot({ size, mood = "idle", still }: { size: number; mood?: Mood; still?: boolean }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (still) return;
    const cook = mood === "cook";
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: cook ? 500 : 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: ND }),
        Animated.timing(a, { toValue: 0, duration: cook ? 500 : 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: ND }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [a, mood, still]);
  const transform =
    mood === "cook"
      ? [{ translateY: size * 0.4 }, { rotate: a.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "8deg"] }) }, { translateY: -size * 0.4 }]
      : [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }];
  const mouth =
    mood === "cheer" ? (
      <Path d="M40 74q10 12 20 0z" fill="#fff" />
    ) : mood === "err" ? (
      <Path d="M42 78q8-6 16 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
    ) : (
      <Path d="M41 74q9 8 18 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
    );
  return (
    <Animated.View style={{ width: size, height: size, transform }} accessible accessibilityRole="image" accessibilityLabel="Si Mangkok">
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Circle cx={50} cy={20} r={10} fill="#F4B82E" stroke="#1C1A17" strokeWidth={3} />
        <SvgText x={50} y={25} fontSize={12} fontWeight="800" textAnchor="middle" fill="#1C1A17">
          Rp
        </SvgText>
        <Path d="M16 50c4-14 18-20 34-20s30 6 34 20z" fill="#fff" stroke="#1C1A17" strokeWidth={3} strokeLinejoin="round" />
        <Path d="M10 50h80c0 26-16 42-40 42S10 76 10 50z" fill="#00855d" stroke="#1C1A17" strokeWidth={3} strokeLinejoin="round" />
        <Circle cx={38} cy={66} r={3.5} fill="#fff" />
        <Circle cx={62} cy={66} r={3.5} fill="#fff" />
        {mouth}
        <Circle cx={29} cy={72} r={4} fill="#FFE3D1" opacity={0.6} />
        <Circle cx={71} cy={72} r={4} fill="#FFE3D1" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
}

/* Plate base shared by every dish. */
const Base = () => (
  <>
    <Ellipse cx={52} cy={56} rx={34} ry={32} fill="#2A1B14" opacity={0.14} />
    <Circle cx={50} cy={50} r={34} fill="#FFFDF8" />
  </>
);

const DISHES: Record<number, React.ReactNode> = {
  // Nasi telur kecap
  1: (
    <G>
      <Base />
      <Circle cx={50} cy={50} r={27} fill="#F4ECDE" />
      <Path d="M27 52c0-14 10-22 23-22s23 8 23 22c0 3-46 3-46 0z" fill="#fff" stroke="#E6DCCB" />
      <Path d="M36 40c4-4 10-5 14-4" stroke="#7B4A22" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M52 56c0-7 7-12 15-10 8 2 9 10 3 14-6 4-18 3-18-4z" fill="#fff" stroke="#E6DCCB" />
      <Circle cx={62} cy={53} r={5} fill="#F2A81D" />
      <Circle cx={38} cy={62} r={2.2} fill="#C8352B" />
      <Circle cx={44} cy={66} r={2.2} fill="#C8352B" />
    </G>
  ),
  // Tumis kangkung tempe
  2: (
    <G>
      <Base />
      <Circle cx={50} cy={50} r={27} fill="#F4ECDE" />
      <Path d="M28 46c8-10 16-8 20 0M36 58c6-12 16-12 22-2M52 40c10-8 18-4 20 6M32 64c10 6 24 8 34-2" stroke="#4F7A55" strokeWidth={5} strokeLinecap="round" fill="none" />
      <Rect x={56} y={52} width={9} height={9} rx={2} fill="#9A6A3A" />
      <Rect x={45} y={56} width={9} height={9} rx={2} fill="#B07C45" />
      <Rect x={62} y={38} width={8} height={8} rx={2} fill="#9A6A3A" />
      <Circle cx={40} cy={52} r={2.2} fill="#C8352B" />
    </G>
  ),
  // Indomie rebus
  3: (
    <G>
      <Base />
      <Circle cx={50} cy={50} r={28} fill="#E9B955" />
      <Path
        d="M30 44c6-6 10 6 16 0s10 6 16 0 8 4 10 0M28 54c6-6 10 6 16 0s10 6 16 0 8 4 12 0M32 64c6-6 10 6 16 0s10 6 16 0"
        stroke="#FFF1C9"
        strokeWidth={3.4}
        fill="none"
        strokeLinecap="round"
      />
      <Ellipse cx={62} cy={40} rx={8} ry={6} fill="#fff" />
      <Circle cx={62} cy={40} r={3.2} fill="#F2A81D" />
      <Path d="M34 36c4-3 8-2 10 2" stroke="#4F7A55" strokeWidth={4} strokeLinecap="round" fill="none" />
    </G>
  ),
};

/** Dish illustration on a tinted gradient tile (`fp()` in the design). */
export function FoodPlate({
  dish,
  color,
  height,
  radius = 12,
  style,
}: {
  dish: number;
  color: string;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const id = useSvgId("fp");
  const art = height * 0.84;
  return (
    <View style={[{ height, width: "100%", borderRadius: radius, overflow: "hidden", alignItems: "center", justifyContent: "center" }, style]}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.33} />
              <Stop offset="1" stopColor={color} stopOpacity={0.82} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </View>
      <Svg viewBox="0 0 100 100" width={art} height={art}>
        {DISHES[dish] ?? DISHES[1]}
      </Svg>
    </View>
  );
}
