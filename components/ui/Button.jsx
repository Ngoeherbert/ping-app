import React from "react";
import { Pressable as RNPressable, StyleSheet } from "react-native";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";

export default function Button({
  onPress,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  style,
  ...props
}) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";

  let bgColor = palette.primary;
  let borderColor = "transparent";

  if (isOutline) {
    bgColor = "transparent";
    borderColor = palette.line;
  }

  if (isGhost) {
    bgColor = "transparent";
    borderColor = "transparent";
  }

  if (disabled) {
    bgColor = palette.surface;
  }

  const sizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 6 },
    md: { paddingHorizontal: 16, paddingVertical: 10 },
    lg: { paddingHorizontal: 20, paddingVertical: 14 },
  }[size];

  return (
    <RNPressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.base,
        sizeStyles,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: isPrimary || isOutline ? 1 : 0,
          borderRadius: variant === "rounded" ? 999 : radius.md,
          alignSelf: fullWidth ? "stretch" : "inline",
        },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {children}
    </RNPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  disabled: {
    opacity: 0.5,
  },
});
