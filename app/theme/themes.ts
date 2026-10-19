import type { ColorSchemeName } from 'react-native'
import { THEME_MODE, THEME_NAME, ThemeMode, ThemeName } from './themes.constants'
import { palette } from './tokens/palette'

export type ThemeColors = {
  background: string
  surface: string
  surfaceElevated: string
  textPrimary: string
  textSecondary: string
  onPrimary: string
  primary: string
  accent: string
  danger: string
  info: string
  disabled: string
  inverse: string
  border: string
  shadow: string
  staticWhite: string
  staticBlack: string
}

export type FixedColorRole = 'onPrimary' | 'shadow' | 'staticWhite' | 'staticBlack'

export type AppTheme = {
  name: ThemeName
  isDark: boolean
  colors: ThemeColors
}

export const fixedColors = {
  onPrimary: palette.white,
  shadow: palette.blackAlpha19,
  staticWhite: palette.white,
  staticBlack: palette.black,
} as const satisfies Pick<ThemeColors, FixedColorRole>

export const lightColors = {
  ...fixedColors,
  background: palette.grey100,
  surface: palette.white,
  surfaceElevated: palette.white,
  textPrimary: palette.grey700,
  textSecondary: palette.grey750Alpha50,
  primary: palette.green300,
  accent: palette.coral400,
  danger: palette.coral300,
  info: palette.blue500,
  disabled: palette.grey400,
  inverse: palette.grey750,
  border: palette.grey350,
} as const satisfies ThemeColors

export const darkColors = {
  ...fixedColors,
  background: palette.grey900,
  surface: palette.grey800,
  surfaceElevated: palette.grey850,
  textPrimary: palette.grey300,
  textSecondary: palette.grey325Alpha50,
  primary: palette.green600,
  accent: palette.red600,
  danger: palette.red700,
  info: palette.blue500,
  disabled: palette.grey500,
  inverse: palette.grey350,
  border: palette.grey700,
} as const satisfies ThemeColors

export const themes: Record<ThemeName, AppTheme> = {
  [THEME_NAME.LIGHT]: { name: THEME_NAME.LIGHT, isDark: false, colors: lightColors },
  [THEME_NAME.DARK]: { name: THEME_NAME.DARK, isDark: true, colors: darkColors },
}

export const resolveThemeName = (themeMode: ThemeMode, colorScheme: ColorSchemeName): ThemeName => {
  if (themeMode !== THEME_MODE.SYSTEM) return themeMode

  return colorScheme === THEME_NAME.DARK ? THEME_NAME.DARK : THEME_NAME.LIGHT
}
