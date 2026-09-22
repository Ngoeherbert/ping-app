import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import Icon from "./Icon";

export default function Header({
  title,
  subtitle,

  showBack = false,
  onBack,

  left,
  right,

  rightActions = [],

  backgroundColor = "#FFFFFF",
  height = 58,

  titleAlign = "left",

  borderBottom = false,
}) {
  const renderRightActions = () => {
    if (right) {
      return right;
    }

    if (!rightActions.length) {
      return null;
    }

    return (
      <View style={styles.actions}>
        {rightActions.map((action, index) => (
          <Pressable
            key={action.id || `${action.icon}-${index}`}
            style={styles.actionButton}
            onPress={action.onPress}
            disabled={!action.onPress}
          >
            <Icon
              name={action.icon}
              size={action.size || 22}
              color={action.color || "#111111"}
              strokeWidth={action.strokeWidth || 1.7}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  const renderLeft = () => {
    if (left) {
      return left;
    }

    if (showBack) {
      return (
        <Pressable style={styles.backButton} onPress={onBack}>
          <Icon name="back" size={23} color="#111111" strokeWidth={1.7} />
        </Pressable>
      );
    }

    return <View style={styles.sidePlaceholder} />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
        },
        borderBottom && styles.borderBottom,
      ]}
    >
      <View style={styles.side}>{renderLeft()}</View>

      <View
        style={[
          styles.center,
          titleAlign === "center" ? styles.centerTitle : styles.leftTitle,
        ]}
      >
        {title && (
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        )}

        {subtitle && (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.side}>{renderRightActions()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },

  side: {
    width: 96,
    minHeight: 58,
    justifyContent: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },

  leftTitle: {
    alignItems: "flex-start",
  },

  centerTitle: {
    alignItems: "center",
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111111",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#777777",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  actionButton: {
    width: 40,
    height: 40,
    marginLeft: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },

  sidePlaceholder: {
    width: 40,
    height: 40,
  },
});
