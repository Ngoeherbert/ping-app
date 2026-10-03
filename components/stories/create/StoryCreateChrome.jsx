import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../../ui/Icon";
import { WA_GREEN } from "./constants";

export function CaptureBtn({ label, hint, onPress, primary }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.capBtn, primary && s.capPrimary, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[s.capLabel, primary && s.capLabelPrimary]}>{label}</Text>
      {!!hint && <Text style={[s.capHint, primary && s.capHintPrimary]}>{hint}</Text>}
    </Pressable>
  );
}

export function EditorTopBar({ top, onBack, onFlip, showFlip, onStyle, onShuffle, canPost, posting, onPost }) {
  return (
    <View style={[s.topBar, { paddingTop: top + 8 }]}>
      <Pressable onPress={onBack} style={s.topBtn} accessibilityRole="button" accessibilityLabel="Back">
        <Icon name="back" size={24} color="#FFFFFF" />
      </Pressable>
      <View style={{ flex: 1 }} />
      {showFlip ? (
        <Pressable onPress={onFlip} style={s.topBtn} accessibilityRole="button" accessibilityLabel="Flip camera">
          <Icon name="rotateCamera" size={22} color="#FFFFFF" />
        </Pressable>
      ) : null}
      {onStyle ? (
        <Pressable onPress={onStyle} style={s.topBtn} accessibilityRole="button" accessibilityLabel="Shuffle text style">
          <Icon name="gameWord" size={22} color="#FFFFFF" />
        </Pressable>
      ) : null}
      {onShuffle ? (
        <Pressable onPress={onShuffle} style={s.topBtn} accessibilityRole="button" accessibilityLabel="Shuffle background colour">
          <Icon name="palette" size={22} color="#FFFFFF" />
        </Pressable>
      ) : null}
      <Pressable
        onPress={onPost}
        disabled={!canPost || posting}
        style={[s.postFab, (!canPost || posting) && { opacity: 0.45 }]}
        accessibilityRole="button"
        accessibilityLabel="Post story"
      >
        <Icon name="send" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  capBtn: { borderRadius: 12, backgroundColor: "#1F2C34", paddingVertical: 13, alignItems: "center", marginTop: 10 },
  capPrimary: { backgroundColor: WA_GREEN },
  capLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  capLabelPrimary: { color: "#FFFFFF" },
  capHint: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },
  capHintPrimary: { color: "rgba(255,255,255,0.85)" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, zIndex: 6 },
  topBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" },
  postFab: { width: 52, height: 52, borderRadius: 26, backgroundColor: WA_GREEN, alignItems: "center", justifyContent: "center" },
});
