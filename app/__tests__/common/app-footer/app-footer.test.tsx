import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import AppFooter from '@common/app-footer/app-footer'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { lightColors } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

const BOTTOM_INSET = 24

jest.mock('@theme/insets', () => ({
  useAppInsets: () => ({ top: 0, right: 0, bottom: 24, left: 0, header: 40, footer: 79 }),
}))

describe('AppFooter', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
  })

  it('renders a bar at the bottom that grows by the navigation bar inset', async () => {
    await render(
      <AppFooter testID='footer'>
        <Text>Actions</Text>
      </AppFooter>
    )

    expect(screen.getByText('Actions')).toBeOnTheScreen()
    expect(StyleSheet.flatten(screen.getByTestId('footer').props.style)).toEqual({
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 4, height: 2 },
      elevation: 4,
      width: '100%',
      backgroundColor: lightColors.surfaceElevated,
      position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      bottom: 0,
      left: 0,
      height: BAR_HEIGHT.HEADER + BOTTOM_INSET,
      paddingTop: 8,
      paddingBottom: 8 + BOTTOM_INSET,
      paddingHorizontal: 30,
      zIndex: 100,
    })
  })
})
