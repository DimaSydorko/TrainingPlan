export const THEME_NAME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export const THEME_MODE = {
  ...THEME_NAME,
  SYSTEM: 'system',
} as const

export type ThemeName = (typeof THEME_NAME)[keyof typeof THEME_NAME]

export type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE]
