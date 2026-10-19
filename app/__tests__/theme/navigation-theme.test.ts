import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { buildNavigationTheme, statusBarStyleFor } from '@theme/navigation-theme'
import { darkColors, lightColors, themes } from '@theme/themes'

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
