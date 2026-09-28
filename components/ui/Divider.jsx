import React from "react";
import { View, StyleSheet } from "react-native";
import { palette } from "../../constants/colors";

export default function Divider({
  vertical = false,
  color = palette.line,
  size = StyleSheet.hairlineWidth,
  style,
}) {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: color, ...(vertical ? { width: size } : { height: size }) },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
  },
  vertical: {
    height: "100%",
  },
});
