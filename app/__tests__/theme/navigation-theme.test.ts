import { renderHook } from '@testing-library/react-native'
import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { buildNavigationTheme, statusBarStyleFor, useScreenOptions } from '@theme/navigation-theme'
import { darkColors, lightColors, themes } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../utils/reset-test-stores'

describe('navigation theme', () => {
  it('builds a light theme from the light app theme', () => {
    const theme = buildNavigationTheme(themes.light)

    expect(theme.dark).toBe(false)
    expect(theme.fonts).toBe(DefaultTheme.fonts)
    expect(theme.colors.background).toBe(lightColors.background)
    expect(theme.colors.card).toBe(lightColors.surfaceElevated)
    expect(theme.colors.text).toBe(lightColors.textPrimary)
    expect(theme.colors.primary).toBe(lightColors.accent)
    expect(theme.colors.border).toBe(DefaultTheme.colors.border)
  })

  it('builds a dark theme from the dark app theme', () => {
    const theme = buildNavigationTheme(themes.dark)

    expect(theme.dark).toBe(true)
    expect(theme.colors.background).toBe(darkColors.background)
    expect(theme.colors.card).toBe(darkColors.surfaceElevated)
    expect(theme.colors.border).toBe(DarkTheme.colors.border)
  })

  it('picks a readable status bar style', () => {
    expect(statusBarStyleFor(themes.dark)).toBe('light')
    expect(statusBarStyleFor(themes.light)).toBe('dark')
  })
})

describe('useScreenOptions', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.DARK })
  })

  it('builds the stack header options from the active theme', async () => {
    const { result } = await renderHook(() => useScreenOptions())

    expect(result.current).toEqual({
      headerTitleAlign: 'center',
      headerTitleStyle: { fontWeight: 'bold' },
      headerTintColor: darkColors.textPrimary,
      headerStyle: {
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 4, height: 2 },
        elevation: 4,
        backgroundColor: darkColors.surfaceElevated,
        shadowColor: darkColors.shadow,
        height: BAR_HEIGHT.HEADER,
      },
      cardStyle: { backgroundColor: darkColors.background },
    })
  })
})
