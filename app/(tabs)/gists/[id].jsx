import React, { useEffect, useMemo, useRef, useState } from "react";
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
import Avatar from "../../../components/ui/Avatar";
import Icon from "../../../components/ui/Icon";
import MessageBubble from "../../../components/messages/MessageBubble";
import MessageComposer from "../../../components/messages/MessageComposer";
import AttachmentMenu from "../../../components/messages/AttachmentMenu";
import TypingIndicator from "../../../components/messages/TypingIndicator";
import { getConversation, getThread } from "../../../lib/gists";
import { palette } from "../../../constants/colors";

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function GistThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversation = getConversation(id);
  const seed = useMemo(() => getThread(id), [id]);
  const [messages, setMessages] = useState(seed);
  const [attachOpen, setAttachOpen] = useState(false);
  // Whether the keyboard was up when the panel opened — the panel only hands
  // the space back to the keyboard if the keyboard was there to begin with.
  const [restoreKeyboard, setRestoreKeyboard] = useState(false);
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const typingTimer = useRef(null);
  const listRef = useRef(null);
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

  const push = (msg) => {
    setMessages((m) => [
      ...m,
      { id: `m-${Date.now()}`, time: now(), status: "sent", isMine: true, kind: "text", ...msg },
    ]);
    setAttachOpen(false);
    requestAnimationFrame(() => listRef.current?.scrollToEnd?.({ animated: true }));
  };

  const send = (text) => push({ kind: "text", text });

  const onTyping = () => {
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 1800);
  };

  const pickImage = async (mediaTypes) => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow photo library access to send media.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (res.canceled || !res.assets?.length) return;
      const a = res.assets[0];
      const kind = (a.type ?? "").startsWith("video") ? "video" : "image";
      push({ kind, uri: a.uri, duration: a.duration ? Math.round(a.duration / 1000) : undefined });
    } catch (e) {
      Alert.alert("Couldn't pick media", String(e?.message ?? e));
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow camera access to take a photo.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (res.canceled || !res.assets?.length) return;
      push({ kind: "image", uri: res.assets[0].uri });
    } catch (e) {
      Alert.alert("Couldn't open camera", String(e?.message ?? e));
    }
  };

  const pickFile = async () => {
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
      });
    } catch (e) {
      Alert.alert("Couldn't pick file", String(e?.message ?? e));
    }
  };

  const onAttach = (actionId) => {
    if (actionId === "image") pickImage(ImagePicker.MediaTypeOptions.Images);
    else if (actionId === "video") pickImage(ImagePicker.MediaTypeOptions.Videos);
    else if (actionId === "camera") takePhoto();
    else if (actionId === "file") pickFile();
    else if (actionId === "view-once") push({ kind: "view-once", mediaType: "photo" });
    else setAttachOpen(false);
  };

  const startVoice = () => setRecording(true);
  const stopVoice = () => {
    if (!recording) return;
    setRecording(false);
    push({ kind: "voice", uri: null, duration: 7 });
  };

  // The attachment panel replaces the keyboard, like a toggle: dismiss the
  // keyboard and size the panel to the exact band it just occupied, so the
  // composer and thread stay put.
  const toggleAttach = () => {
    if (attachOpen) {
      setAttachOpen(false);
      return;
    }

    setRestoreKeyboard(Keyboard.isVisible());

    const band = Math.round(kavHeightRef.current - composerBottomRef.current);
    if (band > 0) lastBandRef.current = band;
    if (lastBandRef.current > 0) setPanelHeight(lastBandRef.current);

    Keyboard.dismiss();
    setAttachOpen(true);
  };

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
        <Avatar uri={conversation?.avatar} name={conversation?.name ?? "?"} size={40} />
        <View style={styles.headMid}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation?.name ?? "Gist"}
          </Text>
          <Text style={styles.presence}>
            {typing ? "typing…" : conversation?.isOnline ? "Online" : "Last seen recently"}
          </Text>
        </View>
        <Pressable style={styles.headBtn}>
          <Icon name="phone" size={20} color={palette.ink} />
        </Pressable>
        <Pressable style={styles.headBtn}>
          <Icon name="more" size={20} color={palette.ink} />
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
          data={messages}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
          renderItem={({ item }) => <MessageBubble item={item} />}
          ListFooterComponent={
            typing ? (
              <View style={styles.typingWrap}>
                <TypingIndicator />
              </View>
            ) : null
          }
        />

        <View onLayout={onComposerLayout}>
          <MessageComposer
            onSend={send}
            attachOpen={attachOpen}
            restoreKeyboard={restoreKeyboard}
            onAttachment={toggleAttach}
            onInputFocus={() => setAttachOpen(false)}
            onCamera={takePhoto}
            onMicPress={startVoice}
            onMicRelease={stopVoice}
            recording={recording}
            onTyping={onTyping}
            placeholder={`Message ${conversation?.name ?? ""}`}
          />
        </View>

        {/* AttachmentMenu is the LAST child so it grows from the bottom of the
            column into the exact band the keyboard just freed. That lets the
            keyboard-dismiss and the panel-grow animations cancel out for the
            composer — it stays put while the panel takes the keyboard's place. */}
        <AttachmentMenu
          visible={attachOpen}
          height={panelHeight}
          onSelect={onAttach}
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
  headMid: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: "700", color: palette.ink },
  presence: { fontSize: 12, color: palette.muted, marginTop: 1 },
  headBtn: { padding: 8 },
  body: { flex: 1 },
  thread: { paddingTop: 14, paddingBottom: 10 },
  typingWrap: { paddingHorizontal: 14, paddingVertical: 6 },
});
