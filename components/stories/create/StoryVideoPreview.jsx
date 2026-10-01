import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

export default function StoryVideoPreview({ uri }) {
  const player = useVideoPlayer(uri ? { uri, contentType: "progressive" } : null, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    try {
      player.play();
    } catch {}
  }, [player]);

  if (!uri) return null;
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
}
