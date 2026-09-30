import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import PhoneScreen from "../components/navigation/PhoneScreen";
import Icon from "../components/ui/Icon";
import { palette } from "../constants/colors";
import { radius } from "../constants/radius";
import {
  getTrendingHashtags,
  getPlaces,
  getSongs,
  getReels,
  formatLikes,
} from "../lib/mockData";

function DiscoverHeader({ onSearch }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => router.back()}
      >
        <Icon name="back" size={24} color={palette.ink} strokeWidth={1.7} />
      </Pressable>
      <Text style={styles.title}>Discover</Text>
      <Pressable
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Search"
        onPress={onSearch}
      >
        <Icon name="search" size={24} color={palette.ink} />
      </Pressable>
    </View>
  );
}

function TrendingHashtags() {
  const hashtags = getTrendingHashtags();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trending</Text>
      {hashtags.map((h) => (
        <View key={h.id} style={styles.hashtagItem}>
          <Text style={styles.hashtagName}>#{h.tag}</Text>
          <Text style={styles.hashtagPosts}>{h.posts} posts</Text>
        </View>
      ))}
    </View>
  );
}

function NearbyPlaces() {
  const places = getPlaces();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nearby</Text>
      {places.map((p) => (
        <Pressable key={p.id} style={styles.placeItem} accessibilityRole="button">
          <View style={styles.placeIcon}>
            <Icon name="location" size={18} color={palette.primary} />
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{p.name}</Text>
            <Text style={styles.placeAddress}>{p.address}</Text>
          </View>
          <Text style={styles.placeCategory}>{p.category}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function PopularReels() {
  const reels = getReels();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Popular Reels</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reelsScroll}>
        {reels.map((r) => (
          <View key={r.id} style={styles.reelCard}>
            <View style={styles.reelThumbnail}>
              <Icon name="music" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.reelTitle}>{r.title}</Text>
            <Text style={styles.reelArtist}>{r.music}</Text>
            <Text style={styles.reelLikes}>{formatLikes(r.likes)} likes</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function PopularSongs() {
  const songs = getSongs();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Popular Songs</Text>
      {songs.map((s) => (
        <View key={s.id} style={styles.songItem}>
          <View style={styles.songRank}>
            <Text style={styles.songRankText}>{songs.indexOf(s) + 1}</Text>
          </View>
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{s.title}</Text>
            <Text style={styles.songArtist}>{s.artist} · {s.duration}</Text>
          </View>
          <Icon name="download" size={20} color={palette.muted} />
        </View>
      ))}
    </View>
  );
}

export default function DiscoverScreen() {
  return (
    <PhoneScreen padded={false}>
      <DiscoverHeader onSearch={() => {}} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}
      >
        <TrendingHashtags />
        <PopularReels />
        <PopularSongs />
        <NearbyPlaces />
      </ScrollView>
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    backgroundColor: palette.card,
  },
  title: { fontSize: 28, fontWeight: "800", color: palette.ink },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  feed: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 24,
  },
  section: { gap: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.ink,
    marginBottom: 10,
  },
  hashtagItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  hashtagName: { fontSize: 16, fontWeight: "600", color: palette.ink },
  hashtagPosts: { fontSize: 13, color: palette.muted },

  reelsScroll: { marginHorizontal: -16, paddingLeft: 16 },
  reelCard: {
    width: 128,
    gap: 6,
    marginRight: 16,
  },
  reelThumbnail: {
    width: 128,
    height: 192,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  reelTitle: { fontSize: 14, fontWeight: "600", color: palette.ink },
  reelArtist: { fontSize: 12, color: palette.muted },
  reelLikes: { fontSize: 11, color: palette.muted },

  songItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  songRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  songRankText: { fontSize: 12, fontWeight: "700", color: palette.primary },
  songInfo: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: 15, fontWeight: "600", color: palette.ink },
  songArtist: { fontSize: 12, color: palette.muted, marginTop: 2 },

  placeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  placeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  placeInfo: { flex: 1, minWidth: 0 },
  placeName: { fontSize: 16, fontWeight: "600", color: palette.ink },
  placeAddress: { fontSize: 13, color: palette.muted },
  placeCategory: { fontSize: 11, color: palette.muted, textTransform: "uppercase" },
});
