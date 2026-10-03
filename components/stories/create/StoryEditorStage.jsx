import React from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import Icon from "../../ui/Icon";
import Avatar from "../../ui/Avatar";
import { linkDomain } from "./constants";
import { s } from "./styles";

export default function StoryEditorStage({
  textMode, voiceMode, caption, setCaption,
  myProfile, privacy, onPrivacy, link, setLink,
  bottom,
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      // "handled" lets taps reach the font/link/mic buttons while the keyboard is
      // open, instead of the keyboard swallowing the first tap.
      keyboardShouldPersistTaps="handled"
      style={s.editWrap}
    >
      <View style={[s.editBar, { paddingBottom: bottom }]}>
        {textMode || voiceMode ? (
          // Text and voice both compose on the centred surface, so this bar
          // carries only the audience control — no caption pill.
          <View style={s.audOnlyRow}>
            <Pressable onPress={onPrivacy} style={s.audPill} accessibilityRole="button" accessibilityLabel="Status privacy">
              <Icon name="users" size={14} color="#FFFFFF" />
              <Text style={s.audText} numberOfLines={1}>{privacy}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.capRow}>
            <Avatar uri={myProfile?.avatar} name={myProfile?.name || "You"} size={34} />
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.65)"
              style={s.capInput}
              maxLength={700}
              returnKeyType="done"
              accessibilityLabel="Caption"
            />
          </View>
        )}
        {link ? (
          <View style={s.linkChip}>
            <Icon name="link" size={15} color="#00A884" />
            <Text style={s.linkText} numberOfLines={1}>{linkDomain(link)}</Text>
            <Pressable onPress={() => setLink(null)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove link">
              <Icon name="close" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
