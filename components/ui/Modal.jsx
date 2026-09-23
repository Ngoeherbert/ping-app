import React from "react";
import { Modal as RNModal, View, StyleSheet } from "react-native";

export default function Modal({
  visible = false,
  transparent = true,
  animationType = "slide",
  onRequestClose,
  children,
  style,
}) {
  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.sheet, style]}>{children}</View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});

