import { I18nManager } from 'react-native';

// Defaults match the xwin/Tawaqoati look. Map these to your app's own colors if you prefer.
export const COLORS = {
  bg: '#0F1B2D',
  card: '#17263C',
  card2: '#1F3250',
  border: '#2A4066',
  text: '#EAF0F9',
  muted: '#8FA3C0',
  accent: '#FFB020',
  accentText: '#2B1D00',
  credit: '#35C9A3',
  debit: '#FF6B73',
  info: '#6EA8FF',
};
export const STAR_COLORS = { red: '#FF4D4F', green: '#2ECC71', yellow: '#FFC531' };
export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const RADIUS = { sm: 8, md: 12, lg: 18, pill: 999 };
export const CURRENCY = 'د.ع';

// Looks right whether or not the OS is already in native RTL mode.
export const RTL = {
  row: I18nManager.isRTL ? 'row' : 'row-reverse',
  start: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  align: 'right',
};
