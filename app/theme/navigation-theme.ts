import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native'
import { AppTheme } from './themes'

export function buildNavigationTheme({ isDark, colors }: AppTheme): Theme {
  const base = isDark ? DarkTheme : DefaultTheme

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.surfaceElevated,
      text: colors.textPrimary,
      notification: colors.danger,
    },
  }
}

export function statusBarStyleFor({ isDark }: Pick<AppTheme, 'isDark'>): 'light' | 'dark' {
  return isDark ? 'light' : 'dark'
}
