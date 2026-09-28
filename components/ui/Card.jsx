import React from "react";
import { View, StyleSheet } from "react-native";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { shadows } from "../../constants/shadows";

export default function Card({ children, style, padding = 16, elevated = true }) {
  return (
    <View
      style={[
        styles.card,
        { padding },
        elevated && shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
  },
});
