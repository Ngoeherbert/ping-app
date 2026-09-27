import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../../components/ui/Avatar";
import Icon from "../../../components/ui/Icon";
import MessageBubble from "../../../components/messages/MessageBubble";
import MessageComposer from "../../../components/messages/MessageComposer";
import ComposerPanel from "../../../components/messages/ComposerPanel";
import MediaDraft from "../../../components/messages/MediaDraft";
import ImagePreviewScreen from "../../../components/messages/ImagePreviewScreen";
import SwipeToReply from "../../../components/messages/SwipeToReply";
import TypingIndicator from "../../../components/messages/TypingIndicator";
import useChatComposer from "../../../components/messages/useChatComposer";
import {
  DateDivider,
  dateDividerStyles,
  getPreviousMessageInRun,
  shouldShowSenderHeader,
  withDateDividers,
} from "../../../components/messages/transcript";
import { getConversation, getThread, resolveMessageSender } from "../../../lib/gists";
import { palette } from "../../../constants/colors";

export default function GistThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversation = getConversation(id);
  const isGroupChat = conversation?.isGroup === true;
  const seed = useMemo(() => getThread(id), [id]);

  const listRef = useRef(null);

  // Every screen that holds a conversation wires up this hook and renders what
  // it hands back, so the composer, the panel, replies and media behave the
  // same everywhere. See useChatComposer.
  const chat = useChatComposer({
    conversation,
    listRef,
    initialMessages: seed,
  });
  const {
    messages,
    typing,
    markViewOnceViewed,
    startReply,
    replyingTo,
    setReplyingTo,
    send,
    onTyping,
    activePanel,
    panelOpen,
    restoreKeyboard,
    panelHeight,
    setActivePanel,
    togglePanel,
    toggleEmojiPanel,
    closePanel,
    mediaDraft,
    setMediaDraft,
    pickAdditionalMedia,
    replaceDraft,
    sendMedia,
    takePhoto,
    onAttach,
    insertEmoji,
    startGame,
    recording,
    recordingDuration,
    voiceDraft,
    startVoiceRecording,
    stopVoiceRecording,
    sendVoiceDraft,
    discardVoiceDraft,
    setVoiceDraftViewOnce,
    composerRef,
    focusRequest,
    onKavLayout,
    onComposerLayout,
  } = chat;

  const listData = useMemo(() => withDateDividers(messages), [messages]);

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
              recordingDuration={recordingDuration}
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

  // The date rules live with the other shared transcript chrome, so every chat
  // draws them the same way. See components/messages/transcript.jsx.
  ...dateDividerStyles,
});
