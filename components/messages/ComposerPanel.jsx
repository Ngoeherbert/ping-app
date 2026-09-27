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
import EmojiPanel from "./EmojiPanel";
import GamePanel from "./GamePanel";

/**
 * Panels the modal can host. There is no tab bar: the entry point decides what
 * shows up — the paperclip opens attachments, the emoji button in the input
 * opens emoji, and the Games tile swaps the content for the game list.
 */
export const PANEL_IDS = {
  attachments: "attachments",
  emojis: "emojis",
  games: "games",
};

/** Header titles for the sub-panels; attachments is the panel's home screen. */
const PANEL_TITLES = {
  [PANEL_IDS.emojis]: "Emoji",
  [PANEL_IDS.games]: "Games",
};

/**
 * Attachment shortcuts, laid out three per row. An action carrying a `panel`
 * swaps the content in place instead of being handed to `onSelect`, so the
 * modal keeps the keyboard's band while the game list replaces the grid.
 */
export const PANEL_ACTIONS = [
  { id: "image", label: "Photo", icon: "image" },
  { id: "video", label: "Video", icon: "video" },
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "file", label: "File", icon: "file" },
  { id: "location", label: "Location", icon: "location" },
  { id: "games", label: "Games", icon: "game", panel: PANEL_IDS.games },
];

// iOS KeyboardAvoidingView animates its keyboard padding with the keyboard's
// own 250ms curve, so the panel uses the same timing to swap in seamlessly.
// Android resizes the window instantly, so the panel swaps instantly too.
const SLIDE_MS = Platform.OS === "ios" ? 250 : 0;
const SLIDE_CURVE = Easing.bezier(0.17, 0.59, 0.4, 0.77);

const ROW_SIZE = 3;

/**
 * ComposerPanel — the reusable composer modal. Stands in for the keyboard
 * (WhatsApp behaviour): the parent dismisses the keyboard and this panel
 * occupies exactly the same bottom area (same height as the keyboard), so the
 * thread never jumps.
 *
 * One modal, many panels: `panel` picks the content (attachments / emoji /
 * games) and every swap happens in place, so moving between panels never
 * re-triggers the slide or moves the thread. Sub-panels carry a back button
 * instead of a persistent tab bar.
 *
 * @param visible         show/hide the panel (animates its height)
 * @param height          band height to occupy — pass the measured keyboard height
 * @param panel           active panel id; defaults to attachments
 * @param onPanelChange   called with the panel id when the content should swap
 * @param onBack          header back handler; defaults to returning to attachments
 * @param onSelect        attachment action handler, receives an action id
 * @param onEmoji         emoji handler, receives the tapped character
 * @param onGame          game handler, receives the tapped game object
 */
export default function ComposerPanel({
  visible = true,
  height = 300,
  panel = PANEL_IDS.attachments,
  onPanelChange,
  onBack,
  actions = PANEL_ACTIONS,
  emojiCategories,
  recentEmojis,
  games,
  onSelect,
  onEmoji,
  onGame,
}) {
  const anim = useRef(new Animated.Value(visible ? height : 0)).current;
  const activePanel = panel ?? PANEL_IDS.attachments;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? height : 0,
      duration: SLIDE_MS,
      easing: SLIDE_CURVE,
      // height is a layout property, so this can't run on the native driver
      useNativeDriver: false,
    }).start();
  }, [anim, height, visible]);

  const rows = [];
  for (let i = 0; i < actions.length; i += ROW_SIZE) {
    rows.push(actions.slice(i, i + ROW_SIZE));
  }

  // Re-tapping the tile that is already showing steps back to the grid, so the
  // tile doubles as the way out of the sub-panel it opened.
  const handleAction = (action) => {
    if (!action.panel) {
      onSelect?.(action.id);
      return;
    }
    onPanelChange?.(
      action.panel === activePanel ? PANEL_IDS.attachments : action.panel,
    );
  };

  const renderContent = () => {
    switch (activePanel) {
      case PANEL_IDS.emojis:
        return (
          <EmojiPanel
            categories={emojiCategories}
            recentEmojis={recentEmojis}
            onSelect={onEmoji}
          />
        );
      case PANEL_IDS.games:
        return <GamePanel games={games} onSelect={onGame} />;
      case PANEL_IDS.attachments:
      default:
        return (
          <View style={styles.rows}>
            {rows.map((row, rowIndex) => (
              <View style={styles.row} key={`attachment-row-${rowIndex}`}>
                {row.map((action) => (
                  <Pressable
                    key={action.id}
                    style={styles.action}
                    onPress={() => handleAction(action)}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                  >
                    <View style={styles.iconContainer}>
                      <Icon name={action.icon} size={22} color="#222222" />
                    </View>

                    <Text numberOfLines={1} style={styles.label}>
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        );
    }
  };

  const title = PANEL_TITLES[activePanel];
  const handleBack = onBack ?? (() => onPanelChange?.(PANEL_IDS.attachments));

  return (
    <Animated.View style={[styles.container, { height: anim }]}>
      {title ? (
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Back to attachments"
          >
            <Icon name="back" size={20} color="#111111" />
          </Pressable>

          <Text numberOfLines={1} style={styles.headerTitle}>
            {title}
          </Text>
        </View>
      ) : null}

      {/* Keyed on the active panel so a swap remounts cleanly instead of
          reconciling two very different trees into each other. */}
      <View key={activePanel} style={styles.content}>
        {renderContent()}
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

  // flex: 1 so the emoji/games bodies get a bounded box to scroll inside;
  // the attachments grid stays content-sized at the top.
  content: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },

  back: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: { fontSize: 15, fontWeight: "700", color: "#111111" },

  rows: {
    flex: 1,
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