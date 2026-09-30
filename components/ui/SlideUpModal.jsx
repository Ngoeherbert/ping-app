import React, {
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetHandle,
} from "@gorhom/bottom-sheet";
import Icon from "./Icon";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { shadows } from "../../constants/shadows";

const SlideUpModal = forwardRef(function SlideUpModal(
  {
    title,
    onClose,
    children,
    snapPoints: customSnapPoints,
    showHandle = true,
    showCloseButton = true,
    closeOnDismiss = true,
    handleStyle,
    backgroundStyle,
    ...props
  },
  ref
) {
  const bottomSheetRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      open: (index) => {
        if (bottomSheetRef.current) {
          bottomSheetRef.current.present();
          if (typeof index === "number") {
            bottomSheetRef.current.snapToIndex(index);
          }
        }
      },
      close: () => {
        if (bottomSheetRef.current) {
          bottomSheetRef.current.dismiss();
        }
      },
      dismiss: () => {
        if (bottomSheetRef.current) {
          bottomSheetRef.current.dismiss();
        }
      },
    }),
    []
  );

  const snapPoints = useMemo(() => {
    if (customSnapPoints) return customSnapPoints;
    return ["25%", "50%", "75%"];
  }, [customSnapPoints]);

  const handleDismiss = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const renderHandle = useCallback(() => {
    if (!showHandle) return null;
    return <BottomSheetHandle style={[styles.handle, handleStyle]} />;
  }, [showHandle, handleStyle]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      enablePanDownToClose={closeOnDismiss}
      enableBackdropPress={closeOnDismiss}
      backgroundStyle={[styles.background, backgroundStyle]}
      handleComponent={renderHandle}
      {...props}
    >
      <View style={styles.header}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <View style={styles.titlePlaceholder} />
        )}
        {showCloseButton && (
          <Pressable
            style={styles.closeBtn}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
            }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Icon name="close" size={22} color={palette.muted} />
          </Pressable>
        )}
      </View>
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default SlideUpModal;

const styles = StyleSheet.create({
  background: {
    backgroundColor: palette.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.card,
  },
  handle: {
    backgroundColor: palette.line,
    width: 40,
    height: 5,
    alignSelf: "center",
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: palette.ink,
  },
  titlePlaceholder: {
    width: 24,
    height: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
