// ─── Brand Colors ─────────────────────────────────────────────────────────────
export const Colors = {
  // Primary - Soft Medical Teal
  primary: '#4ECDC4',
  primaryDark: '#2D9B94',
  primaryLight: '#E8F8F7',
  primarySoft: '#B8E6E3',

  // Secondary - Soft Rose
  secondary: '#F8BBD9',
  secondaryDark: '#E091C7',
  secondaryLight: '#FDF2F8',

  // Accent - Warm Coral
  accent: '#FF9F7A',
  accentDark: '#FF7A50',
  accentLight: '#FFF4F1',

  // Neutral Palette
  slate50: '#FAFBFC',
  slate100: '#F4F6F8',
  slate200: '#E8ECF0',
  slate300: '#D1D9E0',
  slate400: '#9AA6B2',
  slate500: '#6B7785',
  slate600: '#4A5568',
  slate700: '#2D3748',
  slate800: '#1A202C',
  slate900: '#171923',
  slate950: '#0D1117',

  white: '#FFFFFF',
  black: '#000000',

  // Status Colors - Soft & Medical
  success: '#68D391',
  successLight: '#F0FFF4',
  warning: '#F6AD55',
  warningLight: '#FFFAF0',
  error: '#FC8181',
  errorLight: '#FED7D7',
  info: '#63B3ED',
  infoLight: '#EBF8FF',

  // Medical Theme Colors
  rose: '#F687B3',
  roseLight: '#FFF5F7',
  amber: '#F6AD55',
  amberLight: '#FFFAF0',
  blue: '#63B3ED',
  blueLight: '#EBF8FF',
  green: '#68D391',
  greenLight: '#F0FFF4',
  orange: '#FF9F7A',
  orangeLight: '#FFF4F1',
  purple: '#9F7AEA',
  purpleLight: '#FAF5FF',
  teal: '#38B2AC',
  tealLight: '#E6FFFA',
  
  // Gray scale - Softer
  gray50: '#FAFBFC',
  gray100: '#F7FAFC',
  gray200: '#EDF2F7',
  gray300: '#E2E8F0',
  gray400: '#CBD5E0',
  gray500: '#A0AEC0',
  gray600: '#718096',
  gray700: '#4A5568',
  gray800: '#2D3748',
  gray900: '#1A202C',
} as const;

// ─── Light Theme ──────────────────────────────────────────────────────────────
export const LightTheme = {
  background: Colors.gray50,
  surface: Colors.white,
  surfaceSecondary: Colors.gray100,
  text: Colors.slate800,
  textSecondary: Colors.slate600,
  textMuted: Colors.slate500,
  border: Colors.gray200,
  card: Colors.white,
  tabBar: Colors.white,
  tabBarBorder: Colors.gray200,
  inputBg: Colors.white,
  inputBorder: Colors.gray200,
  shadow: 'rgba(45, 55, 72, 0.08)',
  overlay: 'rgba(26, 32, 44, 0.4)',
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────
export const DarkTheme = {
  background: Colors.slate900,
  surface: Colors.slate800,
  surfaceSecondary: Colors.slate700,
  text: Colors.gray50,
  textSecondary: Colors.gray300,
  textMuted: Colors.gray400,
  border: Colors.slate600,
  card: Colors.slate800,
  tabBar: Colors.slate800,
  tabBarBorder: Colors.slate600,
  inputBg: Colors.slate700,
  inputBorder: Colors.slate600,
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};
