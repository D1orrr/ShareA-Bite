import React, { useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Platform, Pressable, View } from "react-native";
import Svg, { Ellipse, G, Path } from "react-native-svg";
import { useReducedMotion, useTheme } from "./theme";
import { Txt } from "./Txt";
import { between, Card, row } from "./ui";

const EGG = 64; // px
const STAGES = 6; // 0 whole egg ... 5 fried egg

/** Egg drawn at crack stage 0-4, or as a fried egg at stage 5. */
function Egg({ stage }: { stage: number }) {
  if (stage >= STAGES - 1) {
    return (
      <Svg width={EGG} height={EGG} viewBox="0 0 64 64">
        <Path d="M10 34c-4-10 6-20 16-19 6-8 20-6 24 2 10 2 12 14 6 20 2 9-8 16-17 13-7 6-20 3-23-4-8-1-11-8-6-12z" fill="#FFFDF6" stroke="#E8DCC4" strokeWidth={2} />
        <Ellipse cx={32} cy={33} rx={11} ry={10} fill="#F4A82A" />
        <Ellipse cx={28.5} cy={29.5} rx={3.5} ry={2.5} fill="#FFD27A" />
      </Svg>
    );
  }
  const cracks = [
    "M24 22l5 4-3 4 5 3",
    "M40 30l-5 3 3 4-4 3",
    "M20 38l6-1 2 4 5-2",
    "M33 12l-2 6 4 3-3 5",
  ].slice(0, stage);
  return (
    <Svg width={EGG} height={EGG} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={58} rx={14} ry={3} fill="rgba(0,0,0,0.18)" />
      <Path d="M32 4C20 4 11 22 11 36c0 12 9 20 21 20s21-8 21-20C53 22 44 4 32 4z" fill="#F7E6CC" stroke="#C9A97A" strokeWidth={2} />
      <Ellipse cx={24} cy={20} rx={4} ry={7} fill="#FFFFFF" opacity={0.6} />
      {stage >= 4 ? <Ellipse cx={32} cy={30} rx={6} ry={5} fill="#F4A82A" /> : null}
      <G stroke="#7A5C33" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {cracks.map(d => (
          <Path key={d} d={d} />
        ))}
      </G>
    </Svg>
  );
}

/**
 * Fidget game for the loading screen: tap the egg, it teleports somewhere else and cracks a
 * bit more each time, until it turns into a fried egg (telur ceplok). Then a new egg appears.
 */
export function EggGame() {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState(0);
  const [score, setScore] = useState(0);
  const pop = useRef(new Animated.Value(1)).current;

  const place = (w: number, h: number) => ({
    x: Math.random() * Math.max(0, w - EGG),
    y: Math.random() * Math.max(0, h - EGG),
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!box.w) setPos({ x: (width - EGG) / 2, y: (height - EGG) / 2 });
    setBox({ w: width, h: height });
  };

  const tap = () => {
    const nextStage = stage >= STAGES - 1 ? 0 : stage + 1;
    if (nextStage === STAGES - 1) setScore(s => s + 1);
    setStage(nextStage);
    setPos(place(box.w, box.h));
    if (!reduced) {
      pop.setValue(0.3);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 160, useNativeDriver: Platform.OS !== "web" }).start();
    }
  };

  const label =
    stage === STAGES - 1 ? "Telur ceplok jadi! Tap lagi buat telur baru" : stage === 0 ? "Tap telurnya!" : `Retak ${stage}/${STAGES - 2}, tap lagi`;

  return (
    <Card style={{ width: "100%", gap: 10 }}>
      <View style={[row, between]}>
        <Txt b style={{ flexShrink: 1 }}>
          Sambil nunggu, pecahin telurnya
        </Txt>
        <Txt v="cap" b color={c.chili} style={{ flexShrink: 0 }}>
          {score} ceplok
        </Txt>
      </View>
      <View
        onLayout={onLayout}
        style={{ height: 180, borderRadius: 16, backgroundColor: c.paper, borderWidth: 1, borderColor: c.bd, overflow: "hidden" }}
      >
        {box.w ? (
          <Animated.View style={{ position: "absolute", left: pos.x, top: pos.y, transform: [{ scale: pop }] }}>
            <Pressable role="button" aria-label={label} onPress={tap} hitSlop={10} style={{ cursor: "pointer" } as object}>
              <Egg stage={stage} />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
      <Txt v="cap" aria-live="polite" style={{ textAlign: "center" }}>
        {label}
      </Txt>
    </Card>
  );
}
