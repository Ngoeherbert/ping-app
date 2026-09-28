import React from "react";
import { Image } from "react-native";
export default function ImageCmp({
  source,
  style,
  size = 48,
  resizeMode = "cover",
  rounded = false,
  ...props
}) {
  const borderRadius = rounded ? size / 2 : 0;

  return (
    <Image
      source={source}
      resizeMode={resizeMode}
      style={[
        { width: size, height: size, borderRadius },
        style,
      ]}
      {...props}
    />
  );
}
