import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const filters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
  { id: "channels", label: "Channels" },
];

export default function MessageFilters({ activeFilter = "all", onChange }) {
  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const active = activeFilter === filter.id;

        return (
          <Pressable
            key={filter.id}
            onPress={() => onChange?.(filter.id)}
            style={styles.item}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {filter.label}
            </Text>

            {active && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },

  item: {
    height: 52,
    paddingHorizontal: 7,
    marginRight: 18,
    justifyContent: "center",
    position: "relative",
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777777",
  },

  activeLabel: {
    color: "#111111",
    fontWeight: "700",
  },

  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#111111",
  },
});
