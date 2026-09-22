import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "../ui/Icon";

export default function MessageSearch({
  value,
  onChangeText,
  placeholder = "Search messages",
}) {
  return (
    <View style={styles.container}>
      <Icon name="search" size={21} color="#777777" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888888"
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 15,
    color: "#111111",
  },
});
