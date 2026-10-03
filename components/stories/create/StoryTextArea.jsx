import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Icon from "../../ui/Icon";
import VoiceBubble from "../../messages/VoiceBubble";
import { fmtDur } from "./constants";
import { s } from "./styles";

/**
 * The single centred composer surface, shared by the text status screen and the
 * voice screen. `voiceMode` is what makes them differ: the text screen is just
 * the field, while the voice screen adds the record control (a voice story is
 * nothing without a recording).
 */
export default function StoryTextArea({
  textMode, textVal, setTextVal, fontWeight, voiceMode,
  take, recording, recordingSec, onToggleRecord, onDeleteTake,
}) {
  return (
    <View pointerEvents="box-none" style={s.textLayer}>
      {textMode ? (
        <TextInput
          value={textVal}
          onChangeText={setTextVal}
          placeholder="Type a status"
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={[s.textInput, { fontWeight }]}
          multiline
          autoFocus
          maxLength={700}
          textAlign="center"
          accessibilityLabel="Status text"
        />
      ) : null}

      {take && !recording ? (
        <View style={s.voicePreview}>
          <VoiceBubble
            uri={take.uri}
            duration={take.duration}
            isMine
            time="now"
            trailing={
              <Pressable
                onPress={onDeleteTake}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove voice note"
              >
                <Icon name="delete" size={16} color="#FF6B6B" />
              </Pressable>
            }
          />
        </View>
      ) : null}

      {/* The record control steps aside once there's a take — the bubble's
          delete action is how you start over. */}
      {voiceMode && !take ? (
        <Pressable
          onPress={onToggleRecord}
          style={[s.micBtn, recording && s.micBtnOn]}
          accessibilityRole="button"
          accessibilityLabel={recording ? "Stop recording" : "Record a voice note"}
        >
          <Icon name={recording ? "pause" : "mic"} size={26} color="#FFFFFF" />
        </Pressable>
      ) : null}

      {recording ? <Text style={s.recStatus}>Recording… {fmtDur(recordingSec)}</Text> : null}
    </View>
  );
}
