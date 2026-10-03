import React from "react";
import Svg, { Path } from "react-native-svg";

// Exact path data from @hugeicons/core-free-icons (HeartIcon, Bookmark02Icon),
// rendered filled instead of stroked so the shape matches the outline icon exactly.
const PATHS = {
  heart:
    "M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z",
  bookmark:
    "M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z",
};

/**
 * Whether a name has a filled path. Lets an "active" control swap to the solid
 * glyph automatically — a filled icon reads as on/off at a glance, exactly like
 * the verified badge's filled tick.
 */
export function hasFilled(name) {
  return Object.prototype.hasOwnProperty.call(PATHS, name);
}

export default function FilledIcon({ name, size = 22, color = "#000000" }) {
  const d = PATHS[name];

  if (!d) {
    console.warn(`[FilledIcon] No filled path for "${name}"`);
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={d} fill={color} />
    </Svg>
  );
}
