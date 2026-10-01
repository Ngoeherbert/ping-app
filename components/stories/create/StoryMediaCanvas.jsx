import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Icon from "../../ui/Icon";
import StoryVideoPreview from "./StoryVideoPreview";
import { fmtDur } from "./constants";

export function StoryMediaCanvas({ media, textMode, textVal, textBg, fontWeight }) {
  if (media?.kind === "image") {
    return <Image source={{ uri: media.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />;
  }
  if (media?.kind === "video") {
    return <StoryVideoPreview uri={media.uri} />;
  }
  if (media?.kind === "audio") {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#111B21", alignItems: "center", justifyContent: "center", padding: 28 }]}>
        <Icon name="mic" size={64} color="#00A884" />
        <Text style={{ color: "#FFFFFF", marginTop: 12, fontSize: 16, fontWeight: "700" }}>Voice status</Text>
        <Text style={{ color: "rgba(255,255,255,0.65)", marginTop: 4, fontSize: 14 }}>{fmtDur(media.duration || 0)}</Text>
      </View>
    );
  }
  if (textMode) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: textBg, alignItems: "center", justifyContent: "center", padding: 28 }]}>
        <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight, textAlign: "center", lineHeight: 40 }}>
          {textVal || "Type a status"}
        </Text>
      </View>
    );
  }
  return null;
}
