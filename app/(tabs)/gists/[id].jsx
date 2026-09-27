import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import Avatar from "../../../components/ui/Avatar";
import Icon from "../../../components/ui/Icon";
import MessageBubble from "../../../components/messages/MessageBubble";
import MessageComposer from "../../../components/messages/MessageComposer";
import ComposerPanel, { PANEL_IDS } from "../../../components/messages/ComposerPanel";
import MediaDraft from "../../../components/messages/MediaDraft";
import ImagePreviewScreen from "../../../components/messages/ImagePreviewScreen";
import SwipeToReply from "../../../components/messages/SwipeToReply";
import { messagePreview } from "../../../components/messages/ReplyQuote";
import TypingIndicator from "../../../components/messages/TypingIndicator";
import useVoiceRecorder from "../../../components/messages/useVoiceRecorder";
import { getConversation, getThread, messageSenderKey, resolveMessageSender } from "../../../lib/gists";
import { palette } from "../../../constants/colors";

const MAX_MEDIA_ITEMS = 10;

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function mediaItemFromAsset(asset) {
  const type = asset?.type ?? asset?.kind ?? "";
  const kind = type === "video" || type === "pairedVideo"
    || String(type).startsWith("video")
    || asset?.mimeType?.startsWith("video/")
    ? "video"
    : "image";

  return {
    kind,
    uri: asset?.uri,
    assetId: asset?.assetId || undefined,
    width: asset?.width || undefined,
    height: asset?.height || undefined,
    duration: asset?.duration ? Math.max(0, asset.duration / 1000) : undefined,
    fileName: asset?.fileName || undefined,
    fileSize: asset?.fileSize || undefined,
    mimeType: asset?.mimeType || undefined,
  };
}

function DateDivider({ label }) {
  return (
    <View style={styles.dateDividerWrap}>
      <View style={styles.dateDividerLine} />
      <Text style={styles.dateDividerText}>{label}</Text>
      <View style={styles.dateDividerLine} />
    </View>
  );
}

function withDateDividers(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  const result = [];
  let lastDate = null;

  for (const msg of messages) {
    const msgDate = msg.date ?? getDateLabel(msg.time);
    if (msgDate !== lastDate) {
      result.push({ id: `divider-${String(msgDate)}`, type: "divider", label: msgDate });
      lastDate = msgDate;
    }
    result.push(msg);
  }

  return result;
}

function getDateLabel(timeStr) {
  if (!timeStr) return "Today";
  if (/^\d{1,2}:\d{2}/.test(timeStr)) return "Today";
  return timeStr;
}

function getPreviousMessageInRun(list, index) {
  if (index <= 0) return null;
  const previous = list[index - 1];
  return previous?.type === "divider" ? null : previous;
}

function shouldShowSenderHeader({ item, previousMessage, conversation, isGroupChat }) {
  if (!isGroupChat || item.isMine) return false;
  const currentKey = messageSenderKey(item, conversation);
  const previousKey = previousMessage ? messageSenderKey(previousMessage, conversation) : null;
  return !(currentKey && previousKey && currentKey === previousKey);
}

export default function GistThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversation = getConversation(id);
  const isGroupChat = conversation?.isGroup === true;
  const seed = useMemo(() => getThread(id), [id]);
  const [messages, setMessages] = useState(seed);
  const listData = useMemo(() => withDateDividers(messages), [messages]);
  // Which composer panel is showing, or null when the keyboard has the space.
  // One modal serves attachments, emoji and games — the entry point picks the
  // content instead of a tab bar. See ComposerPanel.
  const [activePanel, setActivePanel] = useState(null);
  const panelOpen = activePanel !== null;
  // Whether the keyboard was up when the panel opened — the panel only hands
  // the space back to the keyboard if the keyboard was there to begin with.
  const [restoreKeyboard, setRestoreKeyboard] = useState(false);
  const [typing, setTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [mediaDraft, setMediaDraft] = useState(null);
  // A recorded take nobody has sent yet — it waits in the composer's preview bar.
  const [voiceDraft, setVoiceDraft] = useState(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const typingTimer = useRef(null);
  const listRef = useRef(null);
  const composerRef = useRef(null);
  const messageSequenceRef = useRef(0);
  // Layout measurements used to make the attachment panel take over the exact
  // band the keyboard occupied.
  const kavHeightRef = useRef(0);
  const composerBottomRef = useRef(0);
  const lastBandRef = useRef(0);
  const [panelHeight, setPanelHeight] = useState(300);

  const onKavLayout = (e) => {
    kavHeightRef.current = e.nativeEvent.layout.height;
  };

  const onComposerLayout = (e) => {
    const { y, height } = e.nativeEvent.layout;
    composerBottomRef.current = y + height;
  };

  // Android resizes the window instead of padding it, so there is no gap to
  // measure — remember the reported keyboard height for the panel instead.
  useEffect(() => {
    if (Platform.OS === "ios") return undefined;
    const sub = Keyboard.addListener("keyboardDidShow", (e) => {
      const h = Math.round(e?.endCoordinates?.height ?? 0);
      if (h > 0) lastBandRef.current = h;
    });
    return () => sub.remove();
  }, []);

  const closePanel = useCallback(() => setActivePanel(null), []);

  const push = (msg) => {
    const isMedia =
      msg.kind === "image" || msg.kind === "photo" || msg.kind === "video";
    const hasCaption = Boolean(String(msg.text ?? msg.caption ?? "").trim());
    const groupSender = isGroupChat
      ? { senderId: "you", sender: { name: "You", avatar: null } }
      : {};

    if (isMedia) {
      const feedback = hasCaption
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      feedback.catch(() => {});
    }

    const messageId = `m-${Date.now()}-${(messageSequenceRef.current += 1)}`;
    setMessages((current) => [
      ...current,
      {
        id: messageId,
        time: now(),
        status: "sent",
        isMine: true,
        kind: "text",
        ...groupSender,
        ...msg,
      },
    ]);
    closePanel();
    requestAnimationFrame(() => listRef.current?.scrollToEnd?.({ animated: true }));
  };

  const replySnapshot = useCallback((message) => ({
    id: message.id,
    senderName: message.isMine
      ? "You"
      : resolveMessageSender(message, conversation).name ?? conversation?.senderName ?? conversation?.name ?? "Them",
    preview: messagePreview(message),
    isMine: Boolean(message.isMine),
  }), [conversation]);

  const startReply = useCallback((message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    closePanel();
    setReplyingTo(replySnapshot(message));
    if (!mediaDraft) setFocusRequest((value) => value + 1);
  }, [mediaDraft, replySnapshot, closePanel]);

  const send = (text, options = {}) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    push({
      kind: "text",
      text,
      viewOnce: options.viewOnce === true,
      replyTo: replyingTo ?? undefined,
    });
    setReplyingTo(null);
  };

  const markViewOnceViewed = useCallback((messageId) => {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;
        const consumed = { ...message, viewed: true };
        delete consumed.text;
        delete consumed.message;
        delete consumed.caption;
        delete consumed.uri;
        delete consumed.url;
        delete consumed.localUri;
        delete consumed.waveform;
        return consumed;
      }),
    );
  }, []);

  const {
    recording,
    durationMillis: recordingDurationMillis,
    start: startVoiceRecording,
    stop: stopVoiceRecording,
    discard: discardRecording,
  } = useVoiceRecorder({
    onStart: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      closePanel();
      Keyboard.dismiss();
    },
    // Releasing the mic only stops the take. It parks in the composer so the
    // user can play it back, then send or throw it away on purpose.
    onRecorded: ({ uri, duration, viewOnce }) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setVoiceDraft({ uri, duration, viewOnce });
    },
    // Releasing under the minimum just drops the take: nothing is sent, and an
    // alert here would only nag someone who let go a moment early.
    onCanceled: () => {
      setVoiceDraft(null);
    },
  });

  const sendVoiceDraft = () => {
    const draft = voiceDraft;
    if (!draft) return;
    setVoiceDraft(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    push({
      kind: "voice",
      uri: draft.uri,
      duration: draft.duration,
      viewOnce: draft.viewOnce,
      replyTo: replyingTo ?? undefined,
    });
    setReplyingTo(null);
  };

  const discardVoiceDraft = () => {
    const draft = voiceDraft;
    if (!draft) return;
    setVoiceDraft(null);
    discardRecording(draft.uri);
  };

  // The view-once button stays on screen for as long as a take is pending, so it
  // has to be able to re-arm the note before it goes out.
  const setVoiceDraftViewOnce = (next) => {
    setVoiceDraft((current) => (current ? { ...current, viewOnce: next } : current));
  };

  const onTyping = () => {
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 1800);
  };

  const applyAssetToDraft = (asset, replace = false, viewOnce = false) => {
    const media = mediaItemFromAsset(asset);
    setMediaDraft((current) => ({
      ...media,
      assets: [media],
      viewOnce: replace ? Boolean(current?.viewOnce ?? viewOnce) : viewOnce,
      caption: replace ? current?.caption ?? "" : "",
      stickers: replace ? current?.stickers ?? [] : [],
    }));
    closePanel();
  };

  const pickImage = async (kind, replace = false, viewOnce = false) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow photo library access to choose media.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [kind === "video" ? "videos" : "images"],
        allowsEditing: false,
        quality: 0.85,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });
      if (result.canceled || !result.assets?.length) return;
      applyAssetToDraft(result.assets[0], replace, viewOnce);
    } catch (error) {
      Alert.alert("Couldn't choose media", String(error?.message ?? error));
    }
  };

  const pickAdditionalMedia = async () => {
    const currentCount = Array.isArray(mediaDraft?.assets) && mediaDraft.assets.length
      ? mediaDraft.assets.length
      : mediaDraft?.uri
        ? 1
        : 0;
    if (currentCount >= MAX_MEDIA_ITEMS) {
      Alert.alert("Media limit reached", `You can attach up to ${MAX_MEDIA_ITEMS} items.`);
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow photo library access to choose media.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: false,
        quality: 0.85,
        allowsMultipleSelection: true,
        selectionLimit: MAX_MEDIA_ITEMS - currentCount,
      });
      if (result.canceled || !result.assets?.length) return;

      const additions = result.assets.map(mediaItemFromAsset).filter((item) => item.uri);
      setMediaDraft((current) => {
        if (!current) return current;
        const existing = Array.isArray(current.assets) && current.assets.length
          ? current.assets
          : [mediaItemFromAsset(current)];
        const seen = new Set(existing.map((item) => item.uri));
        const next = [...existing];
        for (const addition of additions) {
          if (seen.has(addition.uri)) continue;
          seen.add(addition.uri);
          next.push(addition);
          if (next.length >= MAX_MEDIA_ITEMS) break;
        }
        const [primary] = next;
        return {
          ...current,
          ...primary,
          assets: next,
          caption: current.caption ?? "",
          viewOnce: current.viewOnce === true,
          stickers: Array.isArray(current.stickers) ? current.stickers : [],
        };
      });
    } catch (error) {
      Alert.alert("Couldn't add media", String(error?.message ?? error));
    }
  };


  const takePhoto = async (replace = false, viewOnce = false) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow camera access to take a photo or video.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: false,
        quality: 0.85,
        videoMaxDuration: 60,
      });
      if (result.canceled || !result.assets?.length) return;
      applyAssetToDraft(result.assets[0], replace, viewOnce);
    } catch (error) {
      Alert.alert("Couldn't open camera", String(error?.message ?? error));
    }
  };

  const sendMedia = ({ caption, viewOnce }) => {
    const mediaItems = Array.isArray(mediaDraft?.assets) && mediaDraft.assets.length
      ? mediaDraft.assets
      : mediaDraft?.uri
        ? [mediaDraft]
        : [];
    if (!mediaItems.length) return;

    const trimmedCaption = String(caption ?? "").trim();
    mediaItems.forEach((item, index) => {
      const attachment = mediaItemFromAsset(item);
      push({
        ...attachment,
        text: index === 0 && trimmedCaption ? trimmedCaption : undefined,
        viewOnce: viewOnce === true,
        replyTo: replyingTo ?? undefined,
      });
    });
    setMediaDraft(null);
    setReplyingTo(null);
  };

  const replaceDraft = () => {
    if (!mediaDraft) return;
    if (mediaDraft.kind === "image") takePhoto(true, mediaDraft.viewOnce);
    else pickImage("video", true, mediaDraft.viewOnce);
  };

  const pickFile = async (viewOnce = false) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/*", "*/*"],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const f = res.assets[0];
      push({
        kind: "file",
        uri: f.uri,
        fileName: f.name ?? "document.pdf",
        fileSize: f.size,
        mimeType: f.mimeType ?? "application/pdf",
        viewOnce,
      });
    } catch (e) {
      Alert.alert("Couldn't pick file", String(e?.message ?? e));
    }
  };

  const onAttach = (actionId) => {
    if (actionId === "image") pickImage("image");
    else if (actionId === "video") pickImage("video");
    else if (actionId === "camera") takePhoto();
    else if (actionId === "file") pickFile();
    else closePanel();
  };

  // Emoji picked in the panel go into the composer's input at the caret, so the
  // panel can stay open (focusing the input would summon the keyboard and
  // collapse the panel the emoji came from).
  const insertEmoji = (char) => composerRef.current?.insertEmoji(char);

  // The panel hands over a bare game, or one carrying the picks the popover
  // collected: a party size above two and/or a variant. Both ride along as a
  // short suffix on the invite.
  const startGame = (game) => {
    if (!game) return;
    closePanel();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const picks = [
      game.players > 2 ? `${game.players} players` : null,
      game.mode || null,
    ].filter(Boolean).join(" · ");
    send(picks ? `${game.invite} (${picks})` : game.invite);
  };

  // The composer panel replaces the keyboard, like a toggle: dismiss the
  // keyboard and size the panel to the exact band it just occupied, so the
  // composer and thread stay put. Re-tapping the button that owns the panel
  // that is already up closes it and hands the space back to the keyboard.
  const openPanel = (panelId) => {
    if (activePanel === panelId) {
      closePanel();
      return;
    }

    setRestoreKeyboard(Keyboard.isVisible());

    const band = Math.round(kavHeightRef.current - composerBottomRef.current);
    if (band > 0) lastBandRef.current = band;
    if (lastBandRef.current > 0) setPanelHeight(lastBandRef.current);

    Keyboard.dismiss();
    setActivePanel(panelId);
  };

  // The paperclip owns the modal as a whole, so it closes whatever is showing.
  const togglePanel = () => {
    if (panelOpen) closePanel();
    else openPanel(PANEL_IDS.attachments);
  };

  const toggleEmojiPanel = () => openPanel(PANEL_IDS.emojis);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Icon name="back" size={22} color={palette.ink} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chat info"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/gists/[id]/chat-info",
              params: { id: String(id) },
            })
          }
          style={styles.headAvatar}
        >
          <Avatar uri={conversation?.avatar} name={conversation?.name ?? "?"} size={40} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="User info"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/gists/[id]/chat-info",
              params: { id: String(id) },
            })
          }
          style={styles.headMid}
        >
          <Text style={styles.name} numberOfLines={1}>
            {conversation?.name ?? "Gist"}
          </Text>
          <Text style={styles.presence}>
            {typing ? "typing…" : conversation?.isOnline ? "Online" : "Last seen recently"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.headBtn}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/gists/[id]/voice-call",
              params: { id: String(id) },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Voice call"
        >
          <Icon name="phone" size={20} color={palette.ink} />
        </Pressable>
        <Pressable
          style={styles.headBtn}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/gists/[id]/video-call",
              params: { id: String(id) },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Video call"
        >
          <Icon name="video" size={20} color={palette.ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={0}
        onLayout={onKavLayout}
      >
        <FlatList
          ref={listRef}
          data={listData}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
          renderItem={({ item, index }) => {
            if (item.type === "divider") {
              return <DateDivider label={item.label} />;
            }
            const previousMessage = getPreviousMessageInRun(listData, index);
            const showSenderHeader = shouldShowSenderHeader({
              item,
              previousMessage,
              conversation,
              isGroupChat,
            });
            const sender = resolveMessageSender(item, conversation);
            return (
              <SwipeToReply message={item} onReply={startReply}>
                <MessageBubble
                  item={item}
                  sender={sender}
                  isGroup={isGroupChat}
                  showSenderHeader={showSenderHeader}
                  onReply={startReply}
                  onViewOnceOpen={() => markViewOnceViewed(item.id)}
                />
              </SwipeToReply>
            );
          }}
          ListFooterComponent={
            typing ? (
              <View style={styles.typingWrap}>
                <TypingIndicator />
              </View>
            ) : null
          }
        />

        <View onLayout={onComposerLayout}>
          {mediaDraft?.kind === "image" ? (
            <ImagePreviewScreen
              visible
              draft={mediaDraft}
              receiverName={conversation?.name ?? "Recipient"}
              onChange={(patch) =>
                setMediaDraft((current) => ({ ...current, ...patch }))
              }
              onAdd={pickAdditionalMedia}
              onClose={() => setMediaDraft(null)}
              onSend={sendMedia}
              onTyping={onTyping}
            />
          ) : mediaDraft ? (
            <MediaDraft
              draft={mediaDraft}
              replyTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onChange={(patch) =>
                setMediaDraft((current) => ({ ...current, ...patch }))
              }
              onClose={() => setMediaDraft(null)}
              onReplace={replaceDraft}
              onSend={sendMedia}
              onTyping={onTyping}
            />
          ) : (
            <MessageComposer
              ref={composerRef}
              onSend={send}
              panelOpen={panelOpen}
              panel={activePanel}
              restoreKeyboard={restoreKeyboard}
              onPanelToggle={togglePanel}
              onEmojiPress={toggleEmojiPanel}
              onInputFocus={closePanel}
              onCamera={(options) => takePhoto(false, options?.viewOnce === true)}
              onMicStart={startVoiceRecording}
              onMicFinish={stopVoiceRecording}
              recording={recording}
              recordingDuration={recordingDurationMillis / 1000}
              voiceDraft={voiceDraft}
              onVoiceDraftSend={sendVoiceDraft}
              onVoiceDraftDiscard={discardVoiceDraft}
              onVoiceDraftViewOnceChange={setVoiceDraftViewOnce}
              onTyping={onTyping}
              replyTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              focusRequest={focusRequest}
              placeholder={`Message ${conversation?.name ?? ""}`}
            />
          )}
        </View>

        {/* ComposerPanel is the LAST child so it grows from the bottom of the
            column into the exact band the keyboard just freed. That lets the
            keyboard-dismiss and the panel-grow animations cancel out for the
            composer — it stays put while the panel takes the keyboard's place.
            The same modal hosts attachments, emoji and games, so moving between
            them swaps content in place instead of collapsing the band. */}
        <ComposerPanel
          visible={panelOpen && !mediaDraft}
          panel={activePanel}
          onPanelChange={setActivePanel}
          height={panelHeight}
          onSelect={onAttach}
          onEmoji={insertEmoji}
          onGame={startGame}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  back: { padding: 8 },
  headAvatar: { padding: 4 },
  headMid: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: "700", color: palette.ink },
  presence: { fontSize: 12, color: palette.muted, marginTop: 1 },
  headBtn: { padding: 8 },
  body: { flex: 1 },
  thread: { paddingTop: 14, paddingBottom: 10 },
  typingWrap: { paddingHorizontal: 14, paddingVertical: 6 },
  dateDividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 8,
  },
  dateDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.line,
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: palette.muted,
    textTransform: "capitalize",
  },
});
