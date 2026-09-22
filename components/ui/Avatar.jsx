import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { palette } from "../../constants/colors";

export default function Avatar({ uri, name = "?", size = 48, style }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: { fontWeight: "700", color: palette.primary },
});

