import { useColorScheme } from "react-native";
import { useMemo } from "react";
import palette, { darkPalette } from "../constants/colors";
import spacing from "../constants/spacing";
import radius from "../constants/radius";
import shadows from "../constants/shadows";
import typography from "../constants/typography";

export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return useMemo(
    () => ({
      colors: isDark ? darkPalette : palette,
      spacing,
      radius,
      shadows,
      typography,
      dark: isDark,
      scheme,
    }),
    [isDark, scheme]
  );
};

export const useColors = () => {
  const { colors } = useTheme();
  return colors;
};

export const useRadius = () => radius;
export const useShadows = () => {
  const { shadows } = useTheme();
  return shadows;
};
export const useSpacing = () => spacing;
export const useTypography = () => typography;
