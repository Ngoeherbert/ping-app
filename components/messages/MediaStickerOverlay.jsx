import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const STICKER_POSITIONS = [
  { left: "12%", top: "12%" },
  { right: "10%", top: "18%" },
  { left: "42%", top: "38%" },
  { right: "12%", bottom: "16%" },
  { left: "9%", bottom: "14%" },
  { right: "34%", top: "7%" },
];

export default function MediaStickerOverlay({ stickers = [], onRemove }) {
  if (!Array.isArray(stickers) || stickers.length === 0) return null;

  return (
    <View
      pointerEvents={onRemove ? "box-none" : "none"}
      style={StyleSheet.absoluteFill}
    >
      {stickers.slice(0, STICKER_POSITIONS.length).map((sticker, index) => (
        <Pressable
          key={`${sticker}-${index}`}
          disabled={!onRemove}
          onPress={() => onRemove?.(index)}
          hitSlop={6}
          style={[styles.sticker, STICKER_POSITIONS[index]]}
          accessibilityRole={onRemove ? "button" : undefined}
          accessibilityLabel={
            onRemove ? `Remove ${sticker} sticker` : `${sticker} sticker`
          }
        >
          <Text style={styles.stickerText}>{sticker}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    position: "absolute",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerText: {
    fontSize: 36,
    lineHeight: 44,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

