import React, { useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../../../../components/ui/Avatar";
import Icon from "../../../../components/ui/Icon";
import MessageBubble from "../../../../components/messages/MessageBubble";
import MessageComposer from "../../../../components/messages/MessageComposer";
import ComposerPanel from "../../../../components/messages/ComposerPanel";
import MediaDraft from "../../../../components/messages/MediaDraft";
import ImagePreviewScreen from "../../../../components/messages/ImagePreviewScreen";
import SwipeToReply from "../../../../components/messages/SwipeToReply";
import TypingIndicator from "../../../../components/messages/TypingIndicator";
import useChatComposer from "../../../../components/messages/useChatComposer";
import {
  DateDivider,
  dateDividerStyles,
  getPreviousMessageInRun,
  shouldShowSenderHeader,
  withDateDividers,
} from "../../../../components/messages/transcript";
import { resolveMessageSender } from "../../../../lib/gists";
import {
  AI_CONVERSATION,
  AI_NAME,
  aiOpening,
  useAiResponder,
} from "../../../../lib/ai";
import { palette } from "../../../../constants/colors";

/**
 * AiChatScreen — the assistant, as an ordinary conversation.
 *
 * A normal chat, assembled entirely from the shared parts: the same
 * useChatComposer as every gist thread, the same MessageComposer, the same
 * bubbles, date rules, swipe-to-reply and attachment panel. There is no bespoke
 * composer and no bespoke transcript chrome here — a chat is a header, a
 * transcript and the hook, and this screen is exactly that.
 *
 * The only thing that makes it the AI chat is that it answers: send anything and
 * a reply comes back a beat later with the typing dots up in between.
 *
 * Talking to it instead of typing is a separate screen — the header button
 * opens ../voice.
 */

export default function AiChatScreen() {
  const listRef = useRef(null);

  // The same hook the gist threads use. The assistant is a conversation like any
  // other, so it gets the same composer, the same panel, the same reply quoting
  // and the same media handling — none of it is reimplemented here.
  const chat = useChatComposer({
    conversation: AI_CONVERSATION,
    listRef,
    initialMessages: aiOpening(
      `Hi — I'm ${AI_NAME}. Ask me for a summary, a draft, or the next step, and I'll do my best.`,
    ),
  });
  const {
    messages,
    receive,
    send,
    typing,
    setTyping,
    beginTyping,
    markViewOnceViewed,
    startReply,
    replyingTo,
    setReplyingTo,
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

  // A pending answer must not land after the screen is gone — the shared
  // responder owns that, along with the beat of thinking in between.
  const scheduleReply = useAiResponder({ receive, setTyping, beginTyping });

  // Anything the user sends earns an answer, text or media alike.
  const handleSend = useCallback((...args) => {
    send(...args);
    scheduleReply();
  }, [send, scheduleReply]);

  const handleSendMedia = useCallback((payload) => {
    sendMedia(payload);
    scheduleReply();
  }, [sendMedia, scheduleReply]);

  // A finished take sent from the composer's preview bar earns an answer too.
  const handleSendVoiceDraft = useCallback(() => {
    sendVoiceDraft();
    scheduleReply();
  }, [sendVoiceDraft, scheduleReply]);

  const openInfo = useCallback(() => {
    router.push("/(tabs)/gists/ai/chat-info");
  }, []);

  // Voice mode is a screen of its own, not a mode this one toggles into: same
  // assistant, same conversation, but you talk instead of typing.
  const openVoice = useCallback(() => {
    router.push("/(tabs)/gists/ai/voice");
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {/* Same header shape as the thread — back, avatar, name + presence. The
          call buttons are the one omission: there is nobody to ring, so the info
          button takes their place. */}
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
          onPress={openInfo}
          style={styles.headAvatar}
        >
          <Avatar uri={null} name="AI" size={40} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="User info"
          onPress={openInfo}
          style={styles.headMid}
        >
          <Text style={styles.name} numberOfLines={1}>
            {AI_NAME}
          </Text>
          <Text style={styles.presence}>
            {typing ? "typing…" : "Online"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Talk to ${AI_NAME} by voice`}
          onPress={openVoice}
          style={styles.headBtn}
        >
          <Icon name="aiAudio" size={20} color={palette.ink} />
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
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
          renderItem={({ item, index }) => {
            if (item.type === "divider") {
              return <DateDivider label={item.label} />;
            }

            const previousMessage = getPreviousMessageInRun(listData, index);
            // A 1-1 chat, so the group sender header never shows — asked through
            // the same helper the threads use rather than hardcoded to false.
            const showSenderHeader = shouldShowSenderHeader({
              item,
              previousMessage,
              conversation: AI_CONVERSATION,
              isGroupChat: AI_CONVERSATION.isGroup,
            });
            const sender = resolveMessageSender(item, AI_CONVERSATION);

            return (
              <SwipeToReply message={item} onReply={startReply}>
                <MessageBubble
                  item={item}
                  sender={sender}
                  isGroup={AI_CONVERSATION.isGroup}
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
              receiverName={AI_NAME}
              onChange={(patch) =>
                setMediaDraft((current) => ({ ...current, ...patch }))
              }
              onAdd={pickAdditionalMedia}
              onClose={() => setMediaDraft(null)}
              onSend={handleSendMedia}
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
              onSend={handleSendMedia}
              onTyping={onTyping}
            />
          ) : (
            <MessageComposer
              ref={composerRef}
              onSend={handleSend}
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
              onVoiceDraftSend={handleSendVoiceDraft}
              onVoiceDraftDiscard={discardVoiceDraft}
              onVoiceDraftViewOnceChange={setVoiceDraftViewOnce}
              onTyping={onTyping}
              replyTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              focusRequest={focusRequest}
              placeholder={`Message ${AI_NAME}`}
            />
          )}
        </View>

        {/* ComposerPanel is the LAST child so it grows from the bottom of the
            column into the exact band the keyboard just freed. */}
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
  // Every value below is copied from gists/[id].jsx so the two screens are
  // pixel-identical. Keep them in lockstep.
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

