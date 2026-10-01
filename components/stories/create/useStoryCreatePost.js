import { useCallback, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { normLink } from "./constants";

export function useStoryCreatePost({ onCreateStory, setPublished }) {
  const [posting, setPosting] = useState(false);

  const doPost = useCallback(
    async ({ media, textMode, textVal, textBg, textFont, caption, link }) => {
      const canPost = !!media || (textMode && String(textVal ?? "").trim().length > 0);
      if (!canPost || posting) return;
      setPosting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const cap = textMode ? "" : String(caption ?? "").trim();
      if (media) {
        onCreateStory({
          kind: media.kind,
          uri: media.uri,
          videoUri: media.kind === "video" ? media.uri : undefined,
          cover: media.uri,
          caption: cap,
          link,
          duration: media.duration || 0,
        });
      } else {
        onCreateStory({
          kind: "text",
          uri: null,
          cover: null,
          caption: cap,
          link,
          bg: textBg,
          font: textFont,
          duration: 0,
          text: String(textVal ?? "").trim(),
        });
      }
      await new Promise((r) => setTimeout(r, 500));
      setPosting(false);
      setPublished(true);
    },
    [onCreateStory, posting, setPublished]
  );

  const applyLink = useCallback(
    ({ linkInput, setLink, setLinkInput, close }) => {
      const url = normLink(linkInput);
      if (!url) {
        Alert.alert("Invalid link", "Enter a valid URL like example.com");
        return;
      }
      setLink(url);
      setLinkInput("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      try {
        close?.();
      } catch {}
    },
    []
  );

  return { posting, doPost, applyLink };
}
