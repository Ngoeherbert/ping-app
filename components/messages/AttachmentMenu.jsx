import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";

import Icon from "../ui/Icon";

const actions = [
  { id: "image", label: "Photo", icon: "image" },
  { id: "video", label: "Video", icon: "video" },
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "file", label: "File", icon: "file" },
  { id: "location", label: "Location", icon: "location" },
  { id: "game", label: "Game", icon: "game" },
];

const actionRows = [actions.slice(0, 3), actions.slice(3, 6)];

// iOS KeyboardAvoidingView animates its keyboard padding with the keyboard's
// own 250ms curve, so the panel uses the same timing to swap in seamlessly.
// Android resizes the window instantly, so the panel swaps instantly too.
const SLIDE_MS = Platform.OS === "ios" ? 250 : 0;
const SLIDE_CURVE = Easing.bezier(0.17, 0.59, 0.4, 0.77);

/**
 * AttachmentMenu — stands in for the keyboard (WhatsApp behaviour): the parent
 * dismisses the keyboard and this panel occupies exactly the same bottom area
 * (same height as the keyboard), so the thread never jumps.
 */
export default function AttachmentMenu({
  visible = true,
  height = 300,
  onSelect,
}) {
  const anim = useRef(new Animated.Value(visible ? height : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? height : 0,
      duration: SLIDE_MS,
      easing: SLIDE_CURVE,
      // height is a layout property, so this can't run on the native driver
      useNativeDriver: false,
    }).start();
  }, [anim, height, visible]);

  return (
    <Animated.View style={[styles.container, { height: anim }]}>
      <View style={styles.rows}>
        {actionRows.map((row, rowIndex) => (
          <View style={styles.row} key={`attachment-row-${rowIndex}`}>
            {row.map((action) => (
              <Pressable
                key={action.id}
                style={styles.action}
                onPress={() => onSelect?.(action.id)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <View style={styles.iconContainer}>
                  <Icon name={action.icon} size={22} color="#222222" />
                </View>

                <Text style={styles.label}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
  },

  rows: {
    paddingHorizontal: 22,
    paddingTop: 12,
    rowGap: 10,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  action: {
    width: "33.333%",
    alignItems: "center",
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },

  label: {
    marginTop: 6,
    fontSize: 11,
    color: "#555555",
  },
});
