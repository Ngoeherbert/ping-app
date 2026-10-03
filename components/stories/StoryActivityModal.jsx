import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import FilledIcon from "../../constants/FilledIcon";
import { radius } from "../../constants/radius";

/**
 * One unified audience list: everyone who watched the story, with reactors
 * flagged inline. A person who both viewed AND reacted appears exactly once,
 * so the list never double-counts anyone.
 */
function mergeActivity(story) {
  const byId = new Map();
  for (const v of story?.views ?? []) {
    if (!v) continue;
    byId.set(String(v.userId ?? v.name), { ...v, reacted: false });
  }
  for (const r of story?.reactions ?? []) {
    if (!r) continue;
    const key = String(r.userId ?? r.name);
    const seen = byId.get(key);
    byId.set(key, seen ? { ...seen, reacted: true } : { ...r, reacted: true });
  }
  return [...byId.values()];
}

function PersonRow({ person }) {
  return (
    <View style={s.row}>
      <Avatar uri={person.avatar} name={person.name} size={40} />
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{person.name}</Text>
        {!!person.handle && <Text style={s.personHandle} numberOfLines={1}>{person.handle}</Text>}
      </View>
      {person.reacted ? (
        <View style={s.reactionBadge}>
          <FilledIcon name="heart" size={12} color="#FF4D8D" />
        </View>
      ) : null}
      {!!person.time && <Text style={s.time}>{person.time}</Text>}
    </View>
  );
}

/**
 * Activity sheet for one of YOUR stories: a single audience list of everyone
 * who watched it, with reactors marked inline by a heart badge. Dark, to sit
 * inside the story viewer.
 */
export default function StoryActivityModal({ visible, onClose, story }) {
  const people = mergeActivity(story);
  const reactedCount = people.filter((p) => p.reacted).length;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.headRow}>
            <Text style={s.title}>Story activity</Text>
            <Pressable onPress={onClose} hitSlop={10} style={s.close} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={20} color="rgba(255,255,255,0.75)" />
            </Pressable>
          </View>
          <Text style={s.subtitle}>
            {people.length} {people.length === 1 ? "person" : "people"} · {reactedCount} reacted
          </Text>
          <ScrollView style={s.list} contentContainerStyle={s.listContent}>
            {people.map((p, i) => (
              <PersonRow key={`${p.userId ?? p.name}-${i}`} person={p} />
            ))}
            {people.length === 0 ? (
              <View style={s.empty}>
                <Icon name="eye" size={40} color="rgba(255,255,255,0.35)" />
                <Text style={s.emptyText}>No activity yet</Text>
                <Text style={s.emptySub}>Views and reactions will show up here.</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    maxHeight: "78%",
    backgroundColor: "#1C1C22",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", alignSelf: "center", marginBottom: 10 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  subtitle: { color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 2 },
  list: { marginTop: 12 },
  listContent: { paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)" },
  reactionBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,77,141,0.16)" },
  info: { flex: 1, minWidth: 0 },
  name: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  personHandle: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 1 },
  time: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  empty: { alignItems: "center", gap: 8, paddingVertical: 36 },
  emptyText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  emptySub: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
});