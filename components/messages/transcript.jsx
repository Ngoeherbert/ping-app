import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { messageSenderKey } from "../../lib/gists";
import { palette } from "../../constants/colors";

/**
 * transcript — the chrome every chat screen shares.
 *
 * Date rules, the previous-message lookup that drives sender headers, and the
 * divider styling. Keeping them here is what stops one transcript from drifting
 * into a different look from the next.
 *
 * The list a screen renders is the messages interleaved with dividers, so the
 * render item only has to ask what it got.
 */

export function getDateLabel(timeStr) {
  if (!timeStr) return "Today";
  if (/^\d{1,2}:\d{2}/.test(timeStr)) return "Today";
  return timeStr;
}

export function withDateDividers(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  const result = [];
  let lastDate = null;

  for (const msg of messages) {
    const msgDate = msg.date ?? getDateLabel(msg.time);
    if (msgDate !== lastDate) {
      result.push({ id: `divider-${String(msgDate)}`, type: "divider", label: msgDate });
      lastDate = msgDate;
    }
    result.push(msg);
  }

  return result;
}

/** The message before this row, skipping over any divider that sits between. */
export function getPreviousMessageInRun(list, index) {
  if (index <= 0) return null;
  const previous = list[index - 1];
  return previous?.type === "divider" ? null : previous;
}

/**
 * In a group, name each sender only when the run changes hands — otherwise the
 * same name repeats under every one of their bubbles.
 */
export function shouldShowSenderHeader({ item, previousMessage, conversation, isGroupChat }) {
  if (!isGroupChat || item.isMine) return false;
  const currentKey = messageSenderKey(item, conversation);
  const previousKey = previousMessage ? messageSenderKey(previousMessage, conversation) : null;
  return !(currentKey && previousKey && currentKey === previousKey);
}

export const dateDividerStyles = StyleSheet.create({
  dateDividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 8,
  },
  dateDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.line,
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: palette.muted,
    textTransform: "capitalize",
  },
});

export function DateDivider({ label }) {
  return (
    <View style={dateDividerStyles.dateDividerWrap}>
      <View style={dateDividerStyles.dateDividerLine} />
      <Text style={dateDividerStyles.dateDividerText}>{label}</Text>
      <View style={dateDividerStyles.dateDividerLine} />
    </View>
  );
}
