import { useColorScheme } from 'react-native'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { AppTheme, resolveThemeName, themes } from './themes'

export function useAppTheme(): AppTheme
export function useAppTheme<Selected>(selector: (theme: AppTheme) => Selected): Selected
export function useAppTheme<Selected>(selector?: (theme: AppTheme) => Selected): AppTheme | Selected {
  const themeMode = useSettingsStore(state => state.themeMode)
  const colorScheme = useColorScheme()
  const theme = themes[resolveThemeName(themeMode, colorScheme)]

  return selector ? selector(theme) : theme
}

export const useThemeColors = () => useAppTheme(theme => theme.colors)

export const useIsDarkTheme = () => useAppTheme(theme => theme.isDark)
