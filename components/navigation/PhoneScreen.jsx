import React from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "../../constants/colors";

/**
 * PhoneScreen — shared phone-first screen wrapper.
 * Gives every tab a consistent background, safe-area + status bar.
 */
export default function PhoneScreen({ children, style, padded = true }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.background} />
      <View style={[styles.body, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  body: { flex: 1, backgroundColor: palette.background },
  padded: {
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 4, android: 8, default: 4 }),
  },
});
