import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import Icon from "../ui/Icon";

const MAX_TRANSLATION = 92;
const REPLY_THRESHOLD = 72;
const FLICK_VELOCITY = 900;
const EDGE_HIT_SLOP = 40;
const SPRING = { damping: 19, stiffness: 240, mass: 0.7 };

/**
 * Reveals a reply affordance while a message is swiped. Horizontal movement
 * activates the gesture first, while failOffsetY preserves list scrolling.
 */
export default function SwipeToReply({ children, message, onReply }) {
  const translationX = useSharedValue(0);
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(18)
        .activeOffsetX([-28, 28])
        .failOffsetY([-28, 28])
        .hitSlop({ left: -EDGE_HIT_SLOP, right: -EDGE_HIT_SLOP })
        .onUpdate((event) => {
          translationX.value = Math.max(
            -MAX_TRANSLATION,
            Math.min(MAX_TRANSLATION, event.translationX),
          );
        })
        .onEnd((event) => {
          const crossedThreshold =
            Math.abs(translationX.value) >= REPLY_THRESHOLD;
          const wasFlicked = Math.abs(event.velocityX) >= FLICK_VELOCITY;
          if (crossedThreshold || wasFlicked) {
            runOnJS(onReply)(message);
          }
        })
        .onFinalize(() => {
          translationX.value = withSpring(0, SPRING);
        }),
    [message, onReply, translationX],
  );
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
  }));
  const leftIndicatorStyle = useAnimatedStyle(() => {
    const progress = Math.max(0, Math.min(1, translationX.value / 32));
    return {
      opacity: progress,
      transform: [{ scale: 0.78 + progress * 0.22 }],
    };
  });
  const rightIndicatorStyle = useAnimatedStyle(() => {
    const progress = Math.max(0, Math.min(1, -translationX.value / 32));
    return {
      opacity: progress,
      transform: [{ scale: 0.78 + progress * 0.22 }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, styles.leftIndicator, leftIndicatorStyle]}
      >
        <View style={styles.iconCircle}>
          <Icon name="reply" size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, styles.rightIndicator, rightIndicatorStyle]}
      >
        <View style={styles.iconCircle}>
          <Icon name="reply" size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.gestureRow, rowStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", position: "relative" },
  gestureRow: { width: "100%", zIndex: 1 },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 10,
    width: MAX_TRANSLATION,
    alignItems: "center",
    justifyContent: "center",
  },
  leftIndicator: { left: 0 },
  rightIndicator: { right: 0 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
  },
});

