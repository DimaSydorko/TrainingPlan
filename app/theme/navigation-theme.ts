import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native'
import { AppTheme } from './themes'

export function buildNavigationTheme({ isDark, colors }: AppTheme): Theme {
  const base = isDark ? DarkTheme : DefaultTheme

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

export function statusBarStyleFor({ isDark }: Pick<AppTheme, 'isDark'>): 'light' | 'dark' {
  return isDark ? 'light' : 'dark'
}
