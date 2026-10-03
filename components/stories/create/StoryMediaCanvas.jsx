import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import StoryVideoPreview from "./StoryVideoPreview";

export function StoryMediaCanvas({ media, textMode, voiceMode, textBg }) {
  if (media?.kind === "image") {
    return <Image source={{ uri: media.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />;
  }
  if (media?.kind === "video") {
    return <StoryVideoPreview uri={media.uri} />;
  }
  // Text and voice stories share ONE centred surface in the composer (the field
  // for text, the voice card for audio). So the canvas paints only the surface —
  // rendering content here too would show it twice. Both take their background
  // from the palette, so the header's colour button visibly repaints either.
  if (textMode || voiceMode || media?.kind === "audio") {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: textBg }]} />;
  }
  return null;
}
