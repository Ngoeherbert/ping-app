import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import Icon from "./Icon";
import { palette } from "../../constants/colors";

const ANIM_MS = 280;

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export default function OnboardingOverlay({
  visible = false,
  onboarding = [],
  activeStep = 0,
  onComplete,
  onSkip,
}) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const stepScale = useRef(new Animated.Value(0.85)).current;
  const stepSlide = useRef(new Animated.Value(-24)).current;

  useEffect(() => {
    if (!visible) {
      scale.stopAnimation();
      fade.stopAnimation();
      btnScale.stopAnimation();
      stepScale.stopAnimation();
      stepSlide.stopAnimation();
      scale.setValue(0.6);
      fade.setValue(0);
      btnScale.setValue(1);
      stepScale.setValue(0.85);
      stepSlide.setValue(-24);
      return;
    }
    Animated.parallel(
      [
        Animated.timing(scale, { toValue: 1, duration: ANIM_MS, easing: easeOutBack, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: ANIM_MS / 2, useNativeDriver: true }),
      ],
      { stopTogether: true }
    ).start();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    Animated.parallel(
      [
        Animated.timing(stepScale, { toValue: 1, duration: ANIM_MS, easing: easeOutElastic, useNativeDriver: true }),
        Animated.timing(stepSlide, { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
      ],
      { stopTogether: true }
    ).start();
    Animated.spring(btnScale, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  }, [activeStep]);

  if (!visible) return null;

  const step = onboarding[activeStep];
  if (!step) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <Pressable style={styles.skip} onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: stepScale }, { translateY: stepSlide }] },
        ]}
      >
        <View style={styles.icon}>
          <Icon name={step.icon} size={48} color={palette.primary} />
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        <View style={styles.steps}>
          {onboarding.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeStep && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={[styles.nextBtn, { transform: [{ scale: btnScale }] }]}
          onPress={onComplete}
          onLongPress={onComplete}
        >
          <Text style={styles.nextText}>{activeStep === onboarding.length - 1 ? "Get started" : "Next"}</Text>
        </Pressable>
      </Animated.View>

      <Pressable style={styles.backdrop} onPress={onSkip}>
        <View style={styles.backdropInner} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: palette.dark, alignItems: "center", justifyContent: "center" },
  skip: { position: "absolute", top: 54, left: 0, right: 0, alignItems: "center", zIndex: 1 },
  skipText: { color: palette.primary, fontSize: 15, fontWeight: "600" },
  card: {
    width: 288,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: palette.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  title: { fontSize: 22, fontWeight: "800", color: palette.ink, textAlign: "center", marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 21, color: palette.muted, textAlign: "center", marginBottom: 20 },
  steps: { flexDirection: "row", gap: 8, marginBottom: 22 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.line },
  dotActive: { backgroundColor: palette.primary, width: 26, borderRadius: 4 },
  nextBtn: { width: "100%", paddingVertical: 14, borderRadius: 14, backgroundColor: palette.dark, alignItems: "center" },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backdrop: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120, backgroundColor: "rgba(0,0,0,0.05)" },
  backdropInner: { flex: 1 },
});

