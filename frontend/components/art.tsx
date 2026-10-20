import React, { useId } from "react";
import { Animated, DimensionValue, Platform, StyleSheet, View, ViewStyle } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { font } from "../constants/theme";
import { useLoop, useReducedMotion } from "./theme";

export type Mood = "idle" | "cook" | "cheer" | "err";

export function Mascot({ size, mood = "idle" }: { size: number; mood?: Mood }) {
  const reduced = useReducedMotion();
  const cooking = mood === "cook";
  const v = useLoop(cooking ? 1000 : 2600, !reduced);
  const transform = cooking
    ? [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "8deg"] }) }]
    : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }];

  return (
    <Animated.View
      role="img"
      aria-label="Si Mangkok"
      style={{ width: size, height: size, transformOrigin: "50% 90%", transform }}
    >
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Circle cx={50} cy={20} r={10} fill="#F4B82E" stroke="#1C1A17" strokeWidth={3} />
        <SvgText
          x={50}
          y={25}
          fontSize={12}
          fontFamily={font.head}
          textAnchor="middle"
          fill="#1C1A17"
        >
          Rp
        </SvgText>
        <Path
          d="M16 50c4-14 18-20 34-20s30 6 34 20z"
          fill="#fff"
          stroke="#1C1A17"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <Path
          d="M10 50h80c0 26-16 42-40 42S10 76 10 50z"
          fill="#00855d"
          stroke="#1C1A17"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <Circle cx={38} cy={66} r={3.5} fill="#fff" />
        <Circle cx={62} cy={66} r={3.5} fill="#fff" />
        {mood === "cheer" ? (
          <Path d="M40 74q10 12 20 0z" fill="#fff" />
        ) : mood === "err" ? (
          <Path d="M42 78q8-6 16 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
        ) : (
          <Path d="M41 74q9 8 18 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
        )}
        <Circle cx={29} cy={72} r={4} fill="#FFE3D1" opacity={0.6} />
        <Circle cx={71} cy={72} r={4} fill="#FFE3D1" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
}

function Plate() {
  return (
    <>
      <Ellipse cx={52} cy={56} rx={34} ry={32} fill="#2A1B14" opacity={0.14} />
      <Circle cx={50} cy={50} r={34} fill="#FFFDF8" />
    </>
  );
}

function Dish({ art }: { art: number }) {
  if (art === 2) {
    return (
      <>
        <Plate />
        <Circle cx={50} cy={50} r={27} fill="#F4ECDE" />
        <Path
          d="M28 46c8-10 16-8 20 0M36 58c6-12 16-12 22-2M52 40c10-8 18-4 20 6M32 64c10 6 24 8 34-2"
          stroke="#4F7A55"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        <Rect x={56} y={52} width={9} height={9} rx={2} fill="#9A6A3A" />
        <Rect x={45} y={56} width={9} height={9} rx={2} fill="#B07C45" />
        <Rect x={62} y={38} width={8} height={8} rx={2} fill="#9A6A3A" />
        <Circle cx={40} cy={52} r={2.2} fill="#C8352B" />
      </>
    );
  }
  if (art === 3) {
    return (
      <>
        <Plate />
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
      </>
    );
  }
  return (
    <>
      <Plate />
      <Circle cx={50} cy={50} r={27} fill="#F4ECDE" />
      <Path d="M27 52c0-14 10-22 23-22s23 8 23 22c0 3-46 3-46 0z" fill="#fff" stroke="#E6DCCB" />
      <Path d="M36 40c4-4 10-5 14-4" stroke="#7B4A22" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M52 56c0-7 7-12 15-10 8 2 9 10 3 14-6 4-18 3-18-4z" fill="#fff" stroke="#E6DCCB" />
      <Circle cx={62} cy={53} r={5} fill="#F2A81D" />
      <Circle cx={38} cy={62} r={2.2} fill="#C8352B" />
      <Circle cx={44} cy={66} r={2.2} fill="#C8352B" />
    </>
  );
}

// Stand-in for a real food photo.
export function FoodPhoto({
  art,
  color,
  width = "100%",
  height,
  maxWidth,
  aspect,
  radius = 12,
  style,
}: {
  art: number;
  color: string;
  width?: DimensionValue;
  height?: DimensionValue;
  maxWidth?: DimensionValue;
  aspect?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const gid = "fp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <View
      style={[
        {
          width,
          height,
          maxWidth,
          aspectRatio: aspect,
          borderRadius: radius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={gid} x1="0.21" y1="0.09" x2="0.79" y2="0.91">
            <Stop offset="0" stopColor={color} stopOpacity={0.33} />
            <Stop offset="1" stopColor={color} stopOpacity={0.82} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gid})`} />
      </Svg>
      <View
        style={[
          // Square at 84% of the height, narrower if the photo is narrow.
          { height: "84%", aspectRatio: 1, maxWidth: "100%" },
          Platform.OS === "web" && ({ filter: "drop-shadow(0 12px 14px rgba(42,27,20,0.28))" } as ViewStyle),
        ]}
      >
        <Svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
          <Dish art={art} />
        </Svg>
      </View>
    </View>
  );
}
