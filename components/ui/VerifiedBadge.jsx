import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const VERIFIED_COLORS = {
  blue: "#1D9BF0",
  dark: "#101014",
  white: "#FFFFFF",
  gold: "#FFD700",
};

// white badge needs a dark tick or it disappears
const TICK_COLORS = {
  white: "#101014",
};

const BADGE_PATH =
  "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z";

export default function VerifiedBadge({
  variant = "blue",
  size = 16,
  style,
  inline = false,
}) {
  const fill = VERIFIED_COLORS[variant] || VERIFIED_COLORS.blue;
  const tick = TICK_COLORS[variant] || "#FFFFFF";

  return (
    <View
      style={[
        inline ? styles.badgeInline : styles.badge,
        { width: size, height: size },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={BADGE_PATH} fill={fill} />
        <Path
          d="M9 12l2 2 4-4"
          stroke={tick}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInline: {
    alignItems: "center",
    justifyContent: "center",
  },
});
