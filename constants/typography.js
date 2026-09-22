import { Platform } from 'react-native';

const family = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export const typography = {
  family,
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  title: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 17 },
  tiny: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
  tabLabel: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
};
export default typography;
