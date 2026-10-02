import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import StoryFallback from "./StoryFallback";
import StoryLinkContent from "./StoryLinkContent";
import StoryVideoContent from "./StoryVideoContent";
import StoryAudioContent from "./StoryAudioContent";
import { TEXT_FONTS } from "./create/constants";

function ImageContent({ uri }) {
  const [phase, setPhase] = useState(uri ? "loading" : "error");
  if (!uri || phase === "error") return <StoryFallback icon="image" title="Image unavailable" />;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
        onLoad={() => setPhase("ready")}
        onError={() => setPhase("error")}
      />
      {phase === "loading" ? (
        <View style={s.center}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      ) : null}
    </View>
  );
}

function TextContent({ story }) {
  const weight = TEXT_FONTS.find((f) => f.key === story.font)?.weight ?? "700";
  const body = String(story.text ?? story.caption ?? "");
  const long = body.length > 220;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: story.bg ?? "#111B21" }]}>
      <ScrollView style={s.textScroll} contentContainerStyle={s.textWrap}>
        <Text
          style={{
            color: story.textColor ?? "#FFFFFF",
            fontSize: long ? 22 : 30,
            lineHeight: long ? 32 : 40,
            fontWeight: weight,
            textAlign: story.align ?? "center",
          }}
        >
          {body || " "}
        </Text>
      </ScrollView>
    </View>
  );
}

export default function StoryContent({ story, kind, paused, rate, author, onProgress, onFinish }) {
  switch (kind) {
    case "video":
      return (
        <StoryVideoContent
          uri={story.videoUri ?? story.uri ?? null}
          paused={paused}
          rate={rate}
          onProgress={onProgress}
          onFinish={onFinish}
        />
      );
    case "audio":
      return (
        <StoryAudioContent
          uri={story.audioUri ?? story.uri ?? null}
          title={story.title}
          duration={story.duration}
          author={author}
          paused={paused}
          onProgress={onProgress}
          onFinish={onFinish}
        />
      );
    case "text":
      return <TextContent story={story} />;
    case "link":
      return <StoryLinkContent story={story} />;
    case "image":
    default:
      return <ImageContent uri={story.cover ?? story.uri ?? null} />;
  }
}

const s = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  textScroll: { flex: 1 },
  textWrap: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 24 },
});