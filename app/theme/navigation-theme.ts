import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native'
import { ColorsType } from '@utils/types'
import { colorsDark } from './colors'

/**
 * The app keeps its palette (light or dark) in the settings slice instead of a theme name.
 * The dark palette is the only one whose primary colour is colorsDark.primary; screens already
 * use this check (`colors.primary === colorsDark.primary`).
 */
export function isDarkColors(colors: Pick<ColorsType, 'primary'>): boolean {
  return colors.primary === colorsDark.primary
}

/** React Navigation theme built from the app palette, so stack cards, headers and tab bars match. */
export function buildNavigationTheme(colors: ColorsType): Theme {
  const base = isDarkColors(colors) ? DarkTheme : DefaultTheme
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.secondPrimary,
      background: colors.background,
      card: colors.menu,
      text: colors.text,
      notification: colors.error,
    },
  }
}

/** expo-status-bar style: light text on the dark palette, dark text on the light one. */
export function statusBarStyleFor(colors: Pick<ColorsType, 'primary'>): 'light' | 'dark' {
  return isDarkColors(colors) ? 'light' : 'dark'
}
