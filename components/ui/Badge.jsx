import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";

export default function Badge({
  children,
  variant = "solid",
  color = palette.primary,
  textColor = palette.card,
  size = "md",
  style,
}) {
  const sizeStyles = {
    sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 11 },
    md: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    lg: { paddingHorizontal: 10, paddingVertical: 6, fontSize: 13 },
  }[size];

  const isOutline = variant === "outline";

  return (
    <View
      style={[
        styles.base,
        sizeStyles,
        {
          backgroundColor: isOutline ? "transparent" : color,
          borderColor: color,
          borderWidth: isOutline ? 1 : 0,
        },
        style,
      ]}
    >
      <Text style={{ color: textColor, fontSize: sizeStyles.fontSize, fontWeight: "600" }}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
});
