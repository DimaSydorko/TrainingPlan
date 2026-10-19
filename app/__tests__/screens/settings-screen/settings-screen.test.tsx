import { fireEvent, screen } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import SettingsScreen from '@screens/settings-screen/settings-screen'
import { THEME_MODE } from '@theme/themes.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { renderWithStore } from '../../utils/render'
import { resetTestStores } from '../../utils/reset-test-stores'

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: jest.fn() }))

const mockedUseColorScheme = jest.mocked(useColorScheme)

const isChecked = (testID: string) => screen.getByTestId(testID).props.accessibilityState.checked

describe('SettingsScreen theme', () => {
  beforeEach(() => {
    resetTestStores()
    mockedUseColorScheme.mockReturnValue('dark')
  })

  it('shows the resolved OS theme while following the system', async () => {
    await renderWithStore(<SettingsScreen />)

    expect(isChecked('settings.systemTheme')).toBe(true)
    expect(isChecked('settings.darkTheme')).toBe(true)
  })

  it('switching the dark theme stores an explicit mode', async () => {
    await renderWithStore(<SettingsScreen />)

    await fireEvent(screen.getByTestId('settings.darkTheme'), 'onValueChange')

    expect(useSettingsStore.getState().themeMode).toBe(THEME_MODE.LIGHT)
    expect(isChecked('settings.darkTheme')).toBe(false)
    expect(isChecked('settings.systemTheme')).toBe(false)
  })

  it('turning off the system theme keeps the current look', async () => {
    await renderWithStore(<SettingsScreen />)

    await fireEvent(screen.getByTestId('settings.systemTheme'), 'onValueChange')

    expect(useSettingsStore.getState().themeMode).toBe(THEME_MODE.DARK)
  })

  it('turning on the system theme follows the OS again', async () => {
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
    await renderWithStore(<SettingsScreen />)

    await fireEvent(screen.getByTestId('settings.systemTheme'), 'onValueChange')

    expect(useSettingsStore.getState().themeMode).toBe(THEME_MODE.SYSTEM)
    expect(isChecked('settings.darkTheme')).toBe(true)
  })
})
