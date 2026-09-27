import React, { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

/** Shown before the user has picked anything, so the tab is never empty. */
export const DEFAULT_RECENT = ["❤️", "😂", "👍", "😍", "🎉", "🙏", "🔥", "✅"];

const MAX_RECENT = 28;
const COLUMNS = 8;

/**
 * Category rail + grids. `glyph` is the chip icon and falls back to the first
 * emoji in the set, so a custom dataset only needs the field when its opening
 * emoji makes a poor icon.
 */
export const EMOJI_CATEGORIES = [
  { id: "recent", label: "Favorites", glyph: "🕘", emojis: DEFAULT_RECENT },
  {
    id: "smileys",
    label: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🥳", "😎", "🤓", "🧐", "🤔",
      "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😴", "🤤",
      "😪", "😢", "😭", "😤", "😠", "😡", "🤯", "😳", "🥺", "😱",
      "😨", "😰", "😥", "😷", "🤒", "🤕", "🤢", "🥴", "🤠", "🥸",
    ],
  },
  {
    id: "gestures",
    label: "Gestures",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎",
      "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
      "💪", "🦾", "🦿", "🦵", "🦶", "👂", "👃", "🧠", "👀", "👄",
    ],
  },
  {
    id: "hearts",
    label: "Hearts",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "💯",
      "✨", "⭐️", "🌟", "💫", "💥", "💤", "🔔", "🎈", "🎉", "🎊",
    ],
  },
  {
    id: "nature",
    label: "Nature",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦄", "🐝",
      "🦋", "🐌", "🐞", "🐢", "🐍", "🦎", "🐙", "🦀", "🌵", "🌲",
      "🌴", "🌱", "🌸", "🌺", "🌻", "🌈", "🌙", "☀️", "🔥", "💧",
    ],
  },
  {
    id: "food",
    label: "Food",
    emojis: [
      "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭",
      "🍍", "🥝", "🍅", "🥑", "🍆", "🥦", "🥕", "🌽", "🌶️", "🥐",
      "🍞", "🥚", "🧀", "🍔", "🍟", "🍕", "🌮", "🍣", "🍰", "🎂",
      "🍪", "🍩", "🍫", "🍿", "☕️", "🍺", "🥂", "🍻", "🥧", "🍦",
    ],
  },
  {
    id: "activities",
    label: "Activities",
    emojis: [
      "⚽️", "🏀", "🏈", "⚾️", "🎾", "🏐", "🏓", "🎱", "🏹", "🎯",
      "🎮", "🎲", "🎳", "🕹️", "🎤", "🎧", "🎸", "🎹", "🥁", "🎺",
      "🎬", "🏆", "🥇", "🎪", "🎨", "🎭", "🎟️", "🎁", "🎈", "🧩",
    ],
  },
  {
    id: "travel",
    label: "Travel",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🏎️", "🚓", "🚑", "🚒", "🚚", "🚲",
      "🛴", "🏍️", "✈️", "🚀", "🛸", "🚁", "⛵️", "🚢", "🗺️", "🗽",
      "🗼", "🏰", "⛲️", "🌋", "🏖️", "🏕️", "🌍", "🧭", "🗿",
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    emojis: [
      "✅", "❌", "❗️", "❓", "💬", "💭", "🗯️", "💡", "📌", "📎",
      "🔒", "🔓", "🔔", "🔕", "⏰️", "🕐", "📅", "📈", "📉", "🔍",
      "➕", "➖", "♻️", "⚠️", "🚫", "💯", "🔴", "🟢", "🔵", "⚪️",
    ],
  },
];

/**
 * EmojiPanel — emoji keyboard body for ComposerPanel.
 *
 * Reusable: pass `categories` to swap the dataset, `recentEmojis` to seed the
 * recents, and `onSelect` to receive the tapped character.
 */
export default function EmojiPanel({
  categories = EMOJI_CATEGORIES,
  recentEmojis,
  onSelect,
  style,
}) {
  const [recent, setRecent] = useState(
    Array.isArray(recentEmojis) && recentEmojis.length ? recentEmojis : DEFAULT_RECENT,
  );
  const [activeId, setActiveId] = useState(categories[0]?.id);

  // Keep the selected tab valid when the dataset changes (e.g. server-driven).
  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeId) ?? categories[0],
    [activeId, categories],
  );

  const emojis = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory.id === "recent") return recent.length ? recent : DEFAULT_RECENT;
    return activeCategory.emojis ?? [];
  }, [activeCategory, recent]);

  const handleSelect = (char) => {
    Haptics.selectionAsync().catch(() => {});
    setRecent((current) =>
      [char, ...current.filter((entry) => entry !== char)].slice(0, MAX_RECENT),
    );
    onSelect?.(char, activeCategory);
  };

  if (!activeCategory) return null;

  return (
    <View style={[styles.root, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.rail}
      >
        {categories.map((category) => {
          const active = category.id === activeCategory.id;
          // The chip is a pill, so it needs a glyph to sit beside the label.
          const glyph = category.glyph ?? category.emojis?.[0] ?? "•";
          return (
            <Pressable
              key={category.id}
              onPress={() => setActiveId(category.id)}
              style={[styles.railItem, active && styles.railItemActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={category.label}
            >
              <Text style={styles.railGlyph}>{glyph}</Text>

              <Text
                numberOfLines={1}
                style={[styles.railLabel, active && styles.railLabelActive]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* The key remounts the grid when the category changes, which is also
          what keeps the scroll position from carrying over. */}
      <FlatList
        key={`emoji-grid-${activeCategory.id}`}
        data={emojis}
        numColumns={COLUMNS}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelect(item)}
            style={styles.cell}
            hitSlop={2}
            accessibilityRole="button"
            accessibilityLabel={`Insert ${item}`}
          >
            <Text style={styles.emoji}>{item}</Text>
          </Pressable>
        )}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        initialNumToRender={COLUMNS * 4}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // root: { flex: 1 },

  // Glyph + label in one fully-rounded pill. The label lives inside the pill
  // instead of under a square chip, and maxWidth caps it so a long label
  // truncates rather than stretching the chip into a bar.
  rail: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  railItem: {
    maxWidth: 132,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#F2F2F2",
  },
  railItemActive: { backgroundColor: "#111111" },
  // Colour emoji need more line box than the font size: Android clips the glyph
  // (top included) once lineHeight drops under the font's ascent + descent.
  // Same rule as the grid's `emoji` style below.
  railGlyph: { fontSize: 17, lineHeight: 26 },

  // flexShrink lets the text give way to maxWidth once a label runs out of room.
  railLabel: { flexShrink: 1, fontSize: 12, fontWeight: "600", color: "#555555" },
  railLabelActive: { color: "#FFFFFF" },

  // flexGrow lets a short category (Favorites starts with 8) fill the panel and
  // justifyContent keeps those rows pinned to the top instead of floating in
  // the middle of the empty space below.
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 12,
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  cell: { flex: 1, alignItems: "center", paddingVertical: 4 },
  // lineHeight has to clear the glyph: at fontSize 35 the old 30px line box
  // cut the top off every emoji, since Noto Color Emoji's ascent + descent is
  // well over 1.2em.
  emoji: { fontSize: 35, lineHeight: 46 },
});
