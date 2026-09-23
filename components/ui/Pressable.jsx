import React from "react";
import { Pressable as RNPressable } from "react-native";

export default function Pressable({ onPress, onLongPress, delayLongPress = 250, disabled = false, style, children, accessibilityRole, accessibilityLabel, accessibilityState, ...props }) {
  return (
    <RNPressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      disabled={disabled}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      {...props}
    >
      {children}
    </RNPressable>
  );
}

