import React from "react";
import { Text, View } from "react-native";
import Icon from "../../ui/Icon";
import { s } from "./styles";
import { CaptureBtn } from "./StoryCreateChrome";

export default function StoryDoneStage({ top, privacy, onView, onAgain }) {
  return (
    <View style={s.doneRoot}>
      <View style={[s.doneCard, { marginTop: top + 60 }]}>
        <View style={s.doneTick}>
          <Icon name="check" size={30} color="#FFFFFF" />
        </View>
        <Text style={s.doneTitle}>Status posted</Text>
        <Text style={s.doneSub}>Visible to {privacy.toLowerCase()} for 24 hours</Text>
        <CaptureBtn label="View status" primary onPress={onView} />
        <CaptureBtn label="Post another" onPress={onAgain} />
      </View>
    </View>
  );
}
