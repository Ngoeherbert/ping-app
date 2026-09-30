import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Keyboard, Modal, PanResponder, Pressable, StyleSheet, View } from "react-native";
import Icon from "./Icon";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";

// Custom bottom-sheet built on React Native Modal (no third-party sheet lib).

const SHEET_H = Math.round(Dimensions.get("window").height * 0.72);

function Base(
  { title, onClose, children, footer, showCloseButton = true, dismissOnBackdrop = true, testID },
  ref
) {
  const [visible, setVisible] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);
  const y = useRef(new Animated.Value(SHEET_H)).current;
  const bg = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!visible) { setKbHeight(0); return; }
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => setKbHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKbHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, [visible]);

  const openAnim = useCallback(() => {
    closing.current = false;
    y.setValue(SHEET_H);
    bg.setValue(0);
    Animated.parallel([
      Animated.timing(y, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(bg, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [y, bg]);

  const closeAnim = useCallback((after) => {
    if (closing.current) { after?.(); return; }
    closing.current = true;
    Animated.parallel([
      Animated.timing(y, { toValue: SHEET_H, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(bg, { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => { setVisible(false); after?.(); });
  }, [y, bg]);

  useImperativeHandle(ref, () => ({
    open: () => { closing.current = false; setVisible(true); },
    close: () => closeAnim(() => closeRef.current?.()),
    dismiss: () => closeAnim(() => closeRef.current?.()),
  }), [closeAnim]);

  useEffect(() => { if (visible) openAnim(); }, [visible, openAnim]);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => { if (g.dy >= 0) y.setValue(g.dy); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 110 || g.vy > 0.9) closeAnim(() => closeRef.current?.());
      else Animated.spring(y, { toValue: 0, tension: 260, friction: 30, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => {
      Animated.spring(y, { toValue: 0, tension: 260, friction: 30, useNativeDriver: true }).start();
    },
  })).current;
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent
      onRequestClose={() => closeAnim(() => closeRef.current?.())} testID={testID}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: bg.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Dismiss"
            onPress={dismissOnBackdrop ? () => closeAnim(() => closeRef.current?.()) : undefined} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { height: SHEET_H, transform: [{ translateY: y }] }]}>
          <View style={styles.grabZone} {...pan.panHandlers}>
            <View style={styles.grabber} />
            <View style={styles.header}>
              <View style={styles.titleWrap}>
                {typeof title === "string" ? <Animated.Text style={styles.title}>{title}</Animated.Text> : title}
              </View>
              {showCloseButton && (
                <Pressable style={styles.closeBtn} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close"
                  onPress={() => closeAnim(() => closeRef.current?.())}>
                  <Icon name="close" size={20} color={palette.muted} />
                </Pressable>
              )}
            </View>
          </View>
          <View style={styles.content}>
            <View style={[styles.inner, { paddingBottom: footer ? kbHeight : 0 }]}>
              {children}
              {!!footer && <View style={styles.footer}>{footer}</View>}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const CustomModalSheet = forwardRef(Base);
export default CustomModalSheet;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000000" },
  sheet: { backgroundColor: palette.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: "hidden", elevation: 16 },
  grabZone: { paddingTop: 8 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: palette.line, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  titleWrap: { flex: 1, minWidth: 0, paddingRight: 8 },
  title: { fontSize: 17, fontWeight: "700", color: palette.ink },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.surface, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, minHeight: 0 },
  inner: { flex: 1, minHeight: 0 },
  footer: { width: "100%", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line, backgroundColor: palette.card },
});
