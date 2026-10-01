import React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Icon from "../../ui/Icon";
import Avatar from "../../ui/Avatar";
import VoiceBubble from "../../messages/VoiceBubble";
import { TEXT_BGS, TEXT_FONTS, linkDomain } from "./constants";
import { s } from "./styles";

export default function StoryEditorStage({
  media, textMode, textVal, setTextVal, textBg, setTextBg,
  textFont, setTextFont, fontWeight, caption, setCaption,
  myProfile, privacy, onPrivacy, link, setLink,
  onLink, onVoice, bottom,
}) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.editWrap}>
      <View style={[s.editBar, { paddingBottom: bottom }]}>
        {textMode ? (
          <TextInput
            value={textVal}
            onChangeText={setTextVal}
            placeholder="Type a status"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={{ color: "#FFFFFF", fontSize: 22, fontWeight, textAlign: "center", paddingVertical: 8 }}
            multiline
            autoFocus
            maxLength={700}
            accessibilityLabel="Status text"
          />
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
            <Pressable onPress={onPrivacy} style={s.audPill} accessibilityRole="button" accessibilityLabel="Status privacy">
              <Icon name="users" size={14} color="#FFFFFF" />
              <Text style={s.audText} numberOfLines={1}>{privacy}</Text>
            </Pressable>
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
        {media?.kind === "audio" ? (
          <View style={s.audioPrev}>
            <VoiceBubble uri={media.uri} duration={media.duration || 0} isMine time="now" />
          </View>
        ) : null}
        {textMode ? (
          <View style={s.textTools}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.swRow}>
              {TEXT_BGS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setTextBg(c)}
                  style={[s.sw, { backgroundColor: c }, textBg === c && s.swOn]}
                  accessibilityRole="button"
                  accessibilityLabel="Background color"
                />
              ))}
            </ScrollView>
            <View style={s.toolRow}>
              <View style={s.fontRow}>
                {TEXT_FONTS.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setTextFont(f.key)}
                    style={[s.fontBtn, textFont === f.key && s.fontOn]}
                    accessibilityRole="button"
                    accessibilityLabel="Font style"
                  >
                    <Text style={[s.fontGlyph, { fontWeight: f.weight }, textFont === f.key && { color: "#00A884" }]}>
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={onLink} style={[s.fontBtn, link && s.fontOn]} accessibilityRole="button" accessibilityLabel="Attach link">
                <Icon name="link" size={20} color={link ? "#00A884" : "#FFFFFF"} />
              </Pressable>
              <Pressable onPress={onVoice} style={s.fontBtn} accessibilityRole="button" accessibilityLabel="Attach voice">
                <Icon name="mic" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
