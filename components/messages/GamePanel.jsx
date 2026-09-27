import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import Icon from "../ui/Icon";

/**
 * Game catalogue. `invite` is what gets sent as the message so a game actually
 * starts in the thread — swap this list for a backend feed and the panel is
 * unchanged. `modes` are the variants offered when the game starts.
 */
export const GAMES = [
  {
    id: "ludo",
    title: "Ludo",
    subtitle: "Race your four tokens home",
    icon: "gameDice",
    tint: "#EEECFF",
    // More than two can play, so the popover asks how many are in. "2v2" used to
    // be a mode here; the party size covers it now.
    players: [2, 3, 4],
    modes: ["Classic", "Quick"],
    invite: "🎲 Ludo — roll the dice, you're up first!",
  },
  {
    id: "snake-ladder",
    title: "Snake & Ladder",
    subtitle: "Climb the ladders, slide the snakes",
    icon: "gameSnakeLadder",
    tint: "#E4F6F3",
    invite: "🎲 Snake & Ladder — roll for the ladder, mind the snakes!",
  },
  {
    id: "checkers",
    title: "Checkers",
    subtitle: "Capture, or make it a king",
    icon: "gameCheckers",
    tint: "#EAF7EE",
    invite: "♟️ Checkers — your move.",
  },
  {
    id: "word",
    title: "Word Games",
    subtitle: "Words, letters and clues",
    icon: "gameWord",
    tint: "#FFF1E6",
    modes: ["Wordle", "Unscramble", "Riddle"],
    invite: "🔤 Word game — guess my word!",
  },
  {
    id: "archery",
    title: "Archery",
    subtitle: "Bullseye, or close",
    icon: "gameArchery",
    tint: "#FDECEC",
    invite: "🏹 Archery — nock up and draw!",
  },
  {
    id: "pool",
    title: "Pool",
    subtitle: "Billiards, 8 and 9 ball",
    icon: "gamePool",
    tint: "#E8F4FF",
    modes: ["8 Ball", "9 Ball", "Rack & Shoot"],
    invite: "🎱 Pool — break it, I've got the 8.",
  },
  {
    id: "darts",
    title: "Darts",
    subtitle: "Bullseye or bust",
    icon: "gameDarts",
    tint: "#FFF6D9",
    invite: "🎯 Darts — three darts each, highest wins.",
  },
  {
    id: "basketball",
    title: "Basketball",
    subtitle: "First to score wins",
    icon: "gameBasketball",
    tint: "#FFF1E6",
    invite: "🏀 Basketball — ball up!",
  },
];

/** Games per row, iMessage drawer style. */
const COLUMNS = 4;

/**
 * The two decisions a game can force on the sender. Both return null when there
 * is nothing to decide, which is what lets a plain two-player game send on its
 * first tap instead of opening the popover.
 */
function partyOptions(game) {
  const sizes = Array.isArray(game?.players) ? game.players : [];
  return sizes.length > 1 ? sizes : null;
}

function modeOptions(game) {
  const modes = Array.isArray(game?.modes) ? game.modes : [];
  return modes.length > 1 ? modes : null;
}

/**
 * GamePanel — the game drawer for ComposerPanel, laid out like the iMessage
 * games drawer: a grid of big rounded tiles with the name underneath.
 *
 * Tapping a tile sends the invite straight away when the game is a plain
 * two-player setup — it lands in the thread like any other message. When the
 * game takes more players or ships distinct variants, a small popover opens
 * over the grid to make those picks; it can be dismissed without sending, and
 * its Play button sends.
 *
 * Reusable: pass `games` to swap the catalogue and `onSelect` to receive the
 * game object (id, title, invite, …), carrying `players` and/or `mode` when the
 * popover supplied them.
 */
export default function GamePanel({ games = GAMES, onSelect, style }) {
  // The open popover, holding the game plus the picks made so far.
  const [draft, setDraft] = useState(null);

  if (!Array.isArray(games) || games.length === 0) {
    return (
      <View style={[styles.empty, style]}>
        <Text style={styles.emptyText}>No games available right now.</Text>
      </View>
    );
  }

  const pickGame = (game) => {
    const party = partyOptions(game);
    const modes = modeOptions(game);
    Haptics.selectionAsync().catch(() => {});

    // Nothing to decide: one tap sends, same as picking a sticker.
    if (!party && !modes) {
      onSelect?.(game);
      return;
    }

    setDraft({ game, players: party?.[0] ?? 2, mode: modes?.[0] ?? null });
  };

  const closeDraft = () => {
    Haptics.selectionAsync().catch(() => {});
    setDraft(null);
  };

  const startGame = () => {
    if (!draft) return;
    const { game, players, mode } = draft;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    onSelect?.({
      ...game,
      // Two is the default, so only a bigger party is worth saying out loud.
      ...(players > 2 ? { players } : null),
      ...(mode ? { mode } : null),
    });
  };

  const draftParty = draft ? partyOptions(draft.game) : null;
  const draftModes = draft ? modeOptions(draft.game) : null;

  return (
    <View style={[styles.root, style]}>
      <FlatList
        data={games}
        numColumns={COLUMNS}
        keyExtractor={(game) => game.id}
        renderItem={({ item: game }) => {
          // The ring marks the tile the open popover belongs to.
          const active = game.id === draft?.game.id;
          return (
            <Pressable
              onPress={() => pickGame(game)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Start ${game.title}`}
              accessibilityHint={game.subtitle}
              accessibilityState={{ selected: active }}
            >
              <View
                style={[
                  styles.tile,
                  { backgroundColor: game.tint ?? "#F0F0F0" },
                  active && styles.tileActive,
                ]}
              >
                <Icon name={game.icon} size={26} color="#111111" />
              </View>

              <Text numberOfLines={2} style={styles.cardTitle}>
                {game.title}
              </Text>
            </Pressable>
          );
        }}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.grid}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      />

        {draft && (
          <View style={styles.popover}>
            <View style={styles.popoverHead}>
              <Text numberOfLines={1} style={styles.popoverTitle}>
                {draft.game.title}
              </Text>

              <Pressable
                onPress={closeDraft}
                hitSlop={10}
                style={styles.popoverClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Icon name="close" size={15} color="#555555" />
              </Pressable>
            </View>

            {draftParty && (
              <View style={styles.popoverGroup}>
                <Text style={styles.popoverLabel}>Players</Text>

                <View style={styles.popoverRow}>
                  {draftParty.map((count) => {
                    const on = draft.players === count;
                    return (
                      <Pressable
                        key={count}
                        onPress={() => setDraft((current) => ({ ...current, players: count }))}
                        style={[styles.choice, on && styles.choiceOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${count} players`}
                      >
                        <Text style={[styles.choiceText, on && styles.choiceTextOn]}>
                          {count}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {draftModes && (
              <View style={styles.popoverGroup}>
                <Text style={styles.popoverLabel}>Mode</Text>

                <View style={styles.popoverRow}>
                  {draftModes.map((mode) => {
                    const on = draft.mode === mode;
                    return (
                      <Pressable
                        key={`${draft.game.id}-${mode}`}
                        onPress={() => setDraft((current) => ({ ...current, mode }))}
                        style={[styles.choice, on && styles.choiceOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${draft.game.title}: ${mode}`}
                      >
                        <Text
                          numberOfLines={1}
                          style={[styles.choiceText, on && styles.choiceTextOn]}
                        >
                          {mode}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <Pressable
              onPress={startGame}
              style={({ pressed }) => [styles.play, pressed && styles.playPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Send ${draft.game.title} invite`}
            >
              <Text numberOfLines={1} style={styles.playText}>
                Play
              </Text>
            </Pressable>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // The grid scrolls, so it takes whatever the variant strip leaves behind.
  list: { flex: 1 },

  // iMessage's drawer: a 4-up grid of large square tiles, names underneath.
  // Each card is flex: 1 inside the row, so the tiles divide the width evenly
  // and the aspectRatio keeps them square on any screen.
  grid: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 10,
    // Top-aligns the rows when the catalogue is short, so a partial second row
    // never floats in the middle of the empty space below it.
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  columns: { gap: 10 },

  card: { flex: 1, alignItems: "center", paddingHorizontal: 2 },
  cardPressed: { opacity: 0.6 },

  tile: {
    width: "100%",
    // Capped on purpose: dividing the width alone lets a wide phone inflate the
    // tiles until a second row spills past the bottom of the panel. Four across
    // stays four across, they just stop growing.
    maxWidth: 64,
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  // The ring ties the tile to the variant chips below it.
  tileActive: { borderWidth: 2, borderColor: "#111111" },

  // minHeight keeps one- and two-line names on the same baseline across cards.
  cardTitle: {
    marginTop: 4,
    minHeight: 24,
    fontSize: 11,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  // The popover floats over the bottom of the grid — the root is the positioning
  // context, so it can be dismissed without the panel resizing.
  popover: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 10,
    padding: 12,
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E4E4E8",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  popoverHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  popoverTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#111111" },
  popoverClose: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
  },

  popoverGroup: { gap: 6 },
  popoverLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8A8A8A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  popoverRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  choice: {
    minWidth: 38,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#F2F2F2",
  },
  choiceOn: { backgroundColor: "#111111" },
  choiceText: { fontSize: 12, fontWeight: "600", color: "#333333" },
  choiceTextOn: { color: "#FFFFFF" },

  play: {
    marginTop: 2,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#111111",
  },
  playPressed: { backgroundColor: "#333333" },
  playText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, color: "#777777" },
});