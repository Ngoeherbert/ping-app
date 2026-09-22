import palette, { darkPalette } from './colors';
import spacing from './spacing';
import radius from './radius';
import shadows from './shadows';
import typography from './typography';

export const lightTheme = { colors: palette, spacing, radius, shadows, typography, dark: false };
export const darkTheme = { colors: darkPalette, spacing, radius, shadows, typography, dark: true };

export const theme = lightTheme;
export default theme;
