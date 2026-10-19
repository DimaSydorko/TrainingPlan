import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native'
import { StackNavigationOptions } from '@react-navigation/stack'
import { useAppInsets } from './insets'
import { BASE_SCREEN_OPTIONS, HEADER_BAR_STYLE } from './navigation-theme.constants'
import { AppTheme } from './themes'
import { useAppTheme } from './use-app-theme'

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

export const useScreenOptions = (): StackNavigationOptions => {
  const { colors } = useAppTheme()
  const { header } = useAppInsets()

  return {
    ...BASE_SCREEN_OPTIONS,
    headerTintColor: colors.textPrimary,
    headerStyle: {
      ...HEADER_BAR_STYLE,
      backgroundColor: colors.surfaceElevated,
      shadowColor: colors.shadow,
      height: header,
    },
    cardStyle: { backgroundColor: colors.background },
  }
}
