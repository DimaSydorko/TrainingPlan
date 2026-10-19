import { act, renderHook } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import { colorsDark, colorsLight } from '@theme/colors'
import { resolveThemeName, themes } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { useAppTheme, useIsDarkTheme, useThemeColors } from '@theme/use-app-theme'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../utils/reset-test-stores'

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: jest.fn() }))

const mockedUseColorScheme = jest.mocked(useColorScheme)

describe('resolveThemeName', () => {
  it('uses an explicit mode as is', () => {
    expect(resolveThemeName(THEME_MODE.LIGHT, 'dark')).toBe('light')
    expect(resolveThemeName(THEME_MODE.DARK, 'light')).toBe('dark')
  })

  it('follows the OS in system mode and falls back to light', () => {
    expect(resolveThemeName(THEME_MODE.SYSTEM, 'dark')).toBe('dark')
    expect(resolveThemeName(THEME_MODE.SYSTEM, 'light')).toBe('light')
    expect(resolveThemeName(THEME_MODE.SYSTEM, null)).toBe('light')
    expect(resolveThemeName(THEME_MODE.SYSTEM, undefined)).toBe('light')
  })
})

describe('useAppTheme', () => {
  beforeEach(() => {
    resetTestStores()
    mockedUseColorScheme.mockReturnValue('light')
  })

  it('maps the theme names to the existing palettes', () => {
    expect(themes.light).toEqual({ name: 'light', isDark: false, colors: colorsLight })
    expect(themes.dark).toEqual({ name: 'dark', isDark: true, colors: colorsDark })
  })

  it('resolves the light mode', async () => {
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
    mockedUseColorScheme.mockReturnValue('dark')

    const { result } = await renderHook(() => useAppTheme())

    expect(result.current).toBe(themes.light)
  })

  it('resolves the dark mode', async () => {
    useSettingsStore.setState({ themeMode: THEME_MODE.DARK })

    const { result } = await renderHook(() => useAppTheme())

    expect(result.current).toBe(themes.dark)
  })

  it('follows the OS color scheme in system mode', async () => {
    mockedUseColorScheme.mockReturnValue('dark')

    const { result, rerender } = await renderHook(() => useAppTheme())

    expect(result.current).toBe(themes.dark)

    mockedUseColorScheme.mockReturnValue('light')
    await rerender({})

    expect(result.current).toBe(themes.light)
  })

  it('updates when the stored mode changes', async () => {
    const { result } = await renderHook(() => useAppTheme())

    await act(() => useSettingsStore.getState().setThemeMode(THEME_MODE.DARK))

    expect(result.current.isDark).toBe(true)
  })

  it('exposes narrow selectors', async () => {
    useSettingsStore.setState({ themeMode: THEME_MODE.DARK })

    const { result: name } = await renderHook(() => useAppTheme(theme => theme.name))
    const { result: colors } = await renderHook(() => useThemeColors())
    const { result: isDark } = await renderHook(() => useIsDarkTheme())

    expect(name.current).toBe('dark')
    expect(colors.current).toBe(colorsDark)
    expect(isDark.current).toBe(true)
  })
})
