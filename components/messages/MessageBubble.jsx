import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import Icon from "../ui/Icon";
import VoiceBubble from "./VoiceBubble";
import FileBubble from "./FileBubble";
import ViewOnceBubble from "./ViewOnceBubble";
import VideoBubble from "./VideoBubble";
import ImageBubble from "./ImageBubble";

/**
 * MessageBubble — renders every gist message type:
 * text | image | video | voice | file (pdf) | view-once
 *
 * Backward compatible: old props (message, isMine, time, status, type)
 * still work. New usage: <MessageBubble item={msg} /> where msg is
 * { id, kind/type, text, uri, duration, fileName, fileSize, mimeType, time, isMine, status, ... }
 */
export default function MessageBubble(props) {
  const {
    message,
    item,
    isMine: isMineProp,
    showAvatar = false,
    time: timeProp,
    status: statusProp,
    type: typeProp = "text",
    onPress,
    onViewOnceOpen,
  } = props;

  const data = item ?? {};
  const kind = data.kind ?? data.type ?? typeProp ?? "text";
  const isMine = data.isMine ?? isMineProp ?? false;
  const time = data.time ?? data.timestamp ?? timeProp;
  const status = data.status ?? statusProp;
  const text = data.text ?? data.caption ?? data.message ?? message;
  const uri = data.uri ?? data.url ?? data.localUri;
  const [viewed, setViewed] = useState(data.viewed ?? false);

  const isMedia = kind === "image" || kind === "photo" || kind === "video";
  const hasCaption = !!String(text ?? "").trim();
  // Image/video with no caption: drop the bubble chrome around the media.
  const isBareMedia = isMedia && !!uri && !hasCaption;

  const handleViewOnce = () => {
    if (viewed) return;
    setViewed(true);
    onViewOnceOpen?.(data);
  };

  const renderBody = () => {
    switch (kind) {
      case "image":
      case "photo":
        if (!uri) return null;
        return (
          <ImageBubble
            uri={uri}
            caption={hasCaption ? text : undefined}
            bleed={!isBareMedia}
            isMine={isMine}
            onPress={onPress}
          />
        );

      case "video":
        return (
          <VideoBubble
            uri={uri}
            caption={hasCaption ? text : undefined}
            bleed={!isBareMedia}
            isMine={isMine}
          />
        );

      case "voice":
      case "audio":
        return (
          <VoiceBubble
            uri={uri}
            duration={data.duration ?? 0}
            isMine={isMine}
            waveform={data.waveform}
          />
        );

      case "file":
      case "pdf":
      case "document":
        return (
          <FileBubble
            fileName={data.fileName ?? data.name ?? "document.pdf"}
            fileSize={data.fileSize ?? data.size}
            mimeType={data.mimeType ?? "application/pdf"}
            isMine={isMine}
            onPress={onPress}
          />
        );

      case "view-once":
      case "view_once":
      case "viewonce":
        return (
          <ViewOnceBubble
            viewed={viewed}
            isMine={isMine}
            mediaType={data.mediaType ?? "photo"}
            onOpen={handleViewOnce}
          />
        );

      case "text":
      default:
        return (
          <Text style={[styles.message, isMine ? styles.mineText : styles.theirText]}>
            {text}
          </Text>
        );
    }
  };

  // Media bubbles (image / video) render their own caption under the tile.
  // Caption-less media has no bubble at all — the tile sits on the screen on
  // its own with the time as a small pill on the media instead of a row
  // underneath it.

  return (
    <View style={[styles.row, isMine ? styles.mineRow : styles.theirRow]}>
      {!isMine && showAvatar && <View style={styles.avatarSpace} />}

      <View
        style={[
          styles.bubble,
          isMine ? styles.mineBubble : styles.theirBubble,
          isBareMedia && styles.bareBubble,
        ]}
      >
        {renderBody()}

        {(!!time || (isMine && !!status)) &&
          (isBareMedia ? (
            <View style={styles.mediaMeta} pointerEvents="none">
              <Text style={styles.mediaTime}>{time}</Text>
              {isMine && status && <Icon name="check" size={12} color="#FFFFFF" />}
            </View>
          ) : (
            <View style={styles.meta}>
              <Text style={[styles.time, isMine ? styles.mineTime : styles.theirTime]}>
                {time}
              </Text>

              {isMine && status && <Icon name="check" size={13} color="#777777" />}
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    paddingHorizontal: 14,
    marginBottom: 4,
    flexDirection: "row",
  },

  mineRow: {
    justifyContent: "flex-end",
  },

  theirRow: {
    justifyContent: "flex-start",
  },

  avatarSpace: {
    width: 28,
    marginRight: 5,
  },

  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 18,
  },

  mineBubble: {
    backgroundColor: "#111111",
    borderBottomRightRadius: 5,
  },

  theirBubble: {
    backgroundColor: "#EEEEEE",
    borderBottomLeftRadius: 5,
  },

  message: {
    fontSize: 15,
    lineHeight: 20,
  },

  mineText: {
    color: "#FFFFFF",
  },

  theirText: {
    color: "#222222",
  },

  bareBubble: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
  },

  mediaMeta: {
    position: "absolute",
    right: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  mediaTime: {
    fontSize: 10,
    color: "#FFFFFF",
  },

  meta: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },

  time: {
    fontSize: 10,
  },

  mineTime: {
    color: "#AAAAAA",
  },

  theirTime: {
    color: "#999999",
  },
});

