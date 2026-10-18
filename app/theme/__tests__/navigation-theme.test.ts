import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { buildNavigationTheme, isDarkColors, statusBarStyleFor } from '../navigation-theme'
import { colorsDark, colorsLight } from '../colors'

describe('navigation theme', () => {
  it('detects the dark palette', () => {
    expect(isDarkColors(colorsDark)).toBe(true)
    expect(isDarkColors(colorsLight)).toBe(false)
  })

  it('builds a light theme from the light palette', () => {
    const theme = buildNavigationTheme(colorsLight)
    expect(theme.dark).toBe(false)
    expect(theme.fonts).toBe(DefaultTheme.fonts)
    expect(theme.colors.background).toBe(colorsLight.background)
    expect(theme.colors.card).toBe(colorsLight.menu)
    expect(theme.colors.text).toBe(colorsLight.text)
    expect(theme.colors.primary).toBe(colorsLight.secondPrimary)
    expect(theme.colors.border).toBe(DefaultTheme.colors.border)
  })

  it('builds a dark theme from the dark palette', () => {
    const theme = buildNavigationTheme(colorsDark)
    expect(theme.dark).toBe(true)
    expect(theme.colors.background).toBe(colorsDark.background)
    expect(theme.colors.card).toBe(colorsDark.menu)
    expect(theme.colors.border).toBe(DarkTheme.colors.border)
  })

  it('picks a readable status bar style', () => {
    expect(statusBarStyleFor(colorsDark)).toBe('light')
    expect(statusBarStyleFor(colorsLight)).toBe('dark')
  })
})
