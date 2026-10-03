import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../../ui/Icon";
import CustomModalSheet from "../../ui/CustomModalSheet";

const SheetBase = forwardRef(function SheetBase({ title, onClose, children, footer }, ref) {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({
    open: () => inner.current?.open(),
    close: () => inner.current?.close(),
  }));
  return (
    <CustomModalSheet ref={inner} title={title} onClose={onClose} showCloseButton footer={footer ?? null}>
      {children}
    </CustomModalSheet>
  );
});

export const StatusTextSheet = forwardRef(function StatusTextSheet({ onClose }, ref) {
  return (
    <SheetBase ref={ref} title="Text status" onClose={onClose}>
      <View style={{ paddingBottom: 24 }}>
        <Text style={st.hint}>Write your text on the status canvas, then pick a background color.</Text>
      </View>
    </SheetBase>
  );
});

export const StatusPrivacySheet = forwardRef(function StatusPrivacySheet({ privacy, setPrivacy, sheetRef, onClose }, ref) {
  return (
    <SheetBase ref={ref} title="Who can see this?" onClose={onClose}>
      <View style={{ paddingBottom: 20 }}>
        {["My contacts", "Close friends", "Only me"].map((p) => (
          <Pressable
            key={p}
            onPress={() => {
              setPrivacy(p);
              sheetRef?.current?.close();
            }}
            style={[st.row, privacy === p && st.rowOn]}
            accessibilityRole="button"
            accessibilityLabel={p}
          >
            <Text style={[st.rowText, privacy === p && st.rowTextOn]}>{p}</Text>
            {privacy === p && <Icon name="check" size={18} color="#00A884" />}
          </Pressable>
        ))}
      </View>
    </SheetBase>
  );
});

const st = StyleSheet.create({
  hint: { fontSize: 13, color: "#687076", lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ECECF1" },
  rowOn: { backgroundColor: "#EAF7F1" },
  rowText: { fontSize: 15, color: "#0F1419" },
  rowTextOn: { fontWeight: "800", color: "#00A884" },
});
