import type { ColorSchemeName } from 'react-native'
import { ColorsType } from '@utils/types'
import { colorsDark, colorsLight } from './colors'
import { THEME_MODE, THEME_NAME, ThemeMode, ThemeName } from './themes.constants'

export type AppTheme = {
  name: ThemeName
  isDark: boolean
  colors: ColorsType
}

export const themes: Record<ThemeName, AppTheme> = {
  [THEME_NAME.LIGHT]: { name: THEME_NAME.LIGHT, isDark: false, colors: colorsLight },
  [THEME_NAME.DARK]: { name: THEME_NAME.DARK, isDark: true, colors: colorsDark },
}

export const resolveThemeName = (themeMode: ThemeMode, colorScheme: ColorSchemeName): ThemeName => {
  if (themeMode !== THEME_MODE.SYSTEM) return themeMode

  return colorScheme === THEME_NAME.DARK ? THEME_NAME.DARK : THEME_NAME.LIGHT
}
