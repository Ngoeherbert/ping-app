import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";

import useVoiceRecorder from "./useVoiceRecorder";
import { PANEL_IDS } from "./ComposerPanel";
import { messagePreview } from "./ReplyQuote";
import { resolveMessageSender } from "../../lib/gists";

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

/**
 * useChatComposer — the whole composer pipeline behind a conversation.
 *
 * Owns the message list, the panel that stands in for the keyboard, the reply
 * quote, the media draft, the take waiting to be sent, and the layout
 * measuring that lets the panel take over the exact band the keyboard just
 * freed. Every chat screen wires this up and renders the result the same way,
 * so a gist thread and the AI chat cannot drift apart.
 *
 * @param conversation      the chat being rendered (gists, AI, whoever is next)
 * @param listRef           the transcript's FlatList ref, for scroll-to-end
 * @param initialMessages   seed transcript for the first render
 * @param voiceMode         talk-to-send: a finished take goes straight out
 * @param onVoiceSent       called when a voiceMode take leaves, sent or dropped
 *
 * Screens own their header and their bubbles; everything below the transcript
 * belongs here.
 */
export default function useChatComposer({
  conversation,
  listRef,
  initialMessages,
  voiceMode = false,
  onVoiceSent,
}) {
  const isGroupChat = conversation?.isGroup === true;

  const [messages, setMessages] = useState(initialMessages);

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
  const composerRef = useRef(null);
  const messageSequenceRef = useRef(0);

  // Held in a ref so the recorder's callbacks stay referentially stable: a
  // caller can pass a fresh closure each render without re-opening the
  // microphone underneath itself.
  const onVoiceSentRef = useRef(onVoiceSent);
  useEffect(() => {
    onVoiceSentRef.current = onVoiceSent;
  }, [onVoiceSent]);

  // Layout measurements used to make the attachment panel take over the exact
  // band the keyboard occupied.
  const kavHeightRef = useRef(0);
  const composerBottomRef = useRef(0);
  const lastBandRef = useRef(0);
  const [panelHeight, setPanelHeight] = useState(300);

  const onKavLayout = useCallback((e) => {
    kavHeightRef.current = e.nativeEvent.layout.height;
  }, []);

  const onComposerLayout = useCallback((e) => {
    const { y, height } = e.nativeEvent.layout;
    composerBottomRef.current = y + height;
  }, []);

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

  // The typing indicator is a timer nobody owns; it must not fire into a
  // screen that is already gone.
  useEffect(
    () => () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    },
    [],
  );

  const closePanel = useCallback(() => setActivePanel(null), []);


  // The one way a message enters the transcript. Haptics and the scroll are
  // part of it, so no caller has to remember either.
  const push = useCallback((msg) => {
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
  }, [closePanel, isGroupChat, listRef]);

  // An incoming message: the other side talking. Same append and same scroll as
  // push, so a bot that answers back needs no special case.
  const receive = useCallback((msg) => {
    const messageId = `r-${Date.now()}-${(messageSequenceRef.current += 1)}`;
    setMessages((current) => [
      ...current,
      {
        id: messageId,
        time: now(),
        status: null,
        isMine: false,
        kind: "text",
        ...msg,
      },
    ]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd?.({ animated: true }));
  }, [listRef]);

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

  const send = useCallback((text, options = {}) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    push({
      kind: "text",
      text,
      viewOnce: options.viewOnce === true,
      replyTo: replyingTo ?? undefined,
    });
    setReplyingTo(null);
  }, [push, replyingTo]);

  // A view-once message is consumed the moment it is opened: the body is
  // stripped so there is nothing left to replay, re-share or screenshot.
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
    getMetering,
    start: startVoiceRecording,
    stop: stopVoiceRecording,
    discard: discardRecording,
  } = useVoiceRecorder({
    onStart: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      closePanel();
      Keyboard.dismiss();
    },
    // Releasing the mic only stops the take. Where it goes next depends on the
    // screen: a chat parks it in the composer's preview bar so the user can
    // play it back and choose, while a voice session has no such bar and sends
    // it straight off.
    onRecorded: ({ uri, duration, viewOnce }) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (voiceMode) {
        push({ kind: "voice", uri, duration, viewOnce });
        // A hands-free caller needs to know its turn is over so it can stop
        // listening and hand the floor to the assistant.
        onVoiceSentRef.current?.();
        return;
      }
      setVoiceDraft({ uri, duration, viewOnce });
    },
    // Releasing under the minimum just drops the take: nothing is sent, and an
    // alert here would only nag someone who let go a moment early.
    onCanceled: () => {
      setVoiceDraft(null);
      // A discarded take is still the end of a turn: a hands-free caller that
      // heard a door slam should go back to listening, not stall.
      if (voiceMode) onVoiceSentRef.current?.();
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

  // Raise the indicator without arming the auto-clear. A screen that decides
  // for itself when the other side stopped typing (a bot waiting on a reply)
  // uses this, so the user's own typing timer cannot switch the dots off
  // mid-answer.
  const beginTyping = useCallback(() => {
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, []);

  // Typing a message raises the indicator for as long as the user keeps typing.
  const onTyping = () => {
    beginTyping();
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

  return {
    // transcript
    messages,
    setMessages,
    push,
    receive,
    send,
    markViewOnceViewed,

    // typing — a screen that answers back sets this itself and clears it when
    // the answer lands, so both transcripts share one indicator.
    typing,
    setTyping,
    beginTyping,
    onTyping,

    // reply
    replyingTo,
    setReplyingTo,
    startReply,

    // panel
    activePanel,
    setActivePanel,
    panelOpen,
    restoreKeyboard,
    panelHeight,
    openPanel,
    closePanel,
    togglePanel,
    toggleEmojiPanel,

    // media
    mediaDraft,
    setMediaDraft,
    pickAdditionalMedia,
    replaceDraft,
    sendMedia,
    takePhoto,
    onAttach,

    // panel actions
    insertEmoji,
    startGame,

    // voice
    recording,
    recordingDuration: recordingDurationMillis / 1000,
    getMetering,
    voiceDraft,
    startVoiceRecording,
    stopVoiceRecording,
    sendVoiceDraft,
    discardVoiceDraft,
    setVoiceDraftViewOnce,

    // composer plumbing
    composerRef,
    focusRequest,
    voiceMode,
    onKavLayout,
    onComposerLayout,
  };
}

