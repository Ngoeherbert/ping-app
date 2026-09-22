import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UnreadBadge({ count }) {
  if (!count || count <= 0) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
