import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";
import Icon from "../../ui/Icon";
import { s } from "./styles";

export default function StoryCameraStage({
  camRef, facing, flash, showCamera, focused,
  camPerm, needCam, toggleFlash, flip,
  recording, stopVideo, takePhoto, startVideo,
  pickMedia, onText, onVoice, onLink, bottom,
}) {
  return (
    <>
      {showCamera && focused ? (
        <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing={facing} flash={flash} mode="video" />
      ) : null}
      {showCamera && !camPerm?.granted ? (
        <View style={[s.permBar, { bottom: 190 }]}>
          <Text style={s.permText}>Camera is off. You can still upload, write text, or record voice.</Text>
          <Pressable onPress={needCam} style={s.permBtn} accessibilityRole="button" accessibilityLabel="Enable camera">
            <Text style={s.permBtnText}>Enable</Text>
          </Pressable>
        </View>
      ) : null}
      {showCamera ? (
        <View style={[s.camBottom, { paddingBottom: bottom }]}>
        <View style={s.camRow}>
          <Pressable onPress={toggleFlash} style={s.sideBtn} accessibilityRole="button" accessibilityLabel="Toggle flash">
            <Icon name={flash === "on" ? "flash" : "flashOff"} size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={recording ? stopVideo : takePhoto}
            onLongPress={startVideo}
            delayLongPress={400}
            style={({ pressed }) => [s.shutter, pressed && { transform: [{ scale: 0.94 }] }]}
            accessibilityRole="button"
            accessibilityLabel={recording ? "Stop recording" : "Take photo, hold for video"}
          >
            <View style={[s.shutterCore, recording && s.shutterRec]} />
          </Pressable>
          <Pressable onPress={flip} style={s.sideBtn} accessibilityRole="button" accessibilityLabel="Flip camera">
            <Icon name="rotateCamera" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={s.camHint}>Tap for photo - hold for video (60s)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickRow}>
          <Pressable onPress={pickMedia} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Upload photo or video">
            <Icon name="image" size={22} color="#00A884" />
            <Text style={s.pickLabel}>Gallery</Text>
          </Pressable>
          <Pressable onPress={onText} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Write text status">
            <Text style={s.pickGlyph}>Aa</Text>
            <Text style={s.pickLabel}>Text</Text>
          </Pressable>
          <Pressable onPress={onVoice} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Record voice status">
            <Icon name="mic" size={22} color="#00A884" />
            <Text style={s.pickLabel}>Voice</Text>
          </Pressable>
          <Pressable onPress={onLink} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Add link">
            <Icon name="link" size={22} color="#00A884" />
            <Text style={s.pickLabel}>Link</Text>
          </Pressable>
        </ScrollView>
        </View>
      ) : null}
    </>
  );
}
