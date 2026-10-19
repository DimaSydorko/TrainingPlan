import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import AppHeader from '@common/app-header/app-header'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { lightColors } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

describe('AppHeader', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
  })

  it('renders a bar above the screen content', async () => {
    await render(
      <AppHeader testID='header' style={{ padding: 0 }}>
        <Text>Title</Text>
      </AppHeader>
    )

    expect(screen.getByText('Title')).toBeOnTheScreen()
    expect(StyleSheet.flatten(screen.getByTestId('header').props.style)).toEqual({
      height: 40,
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
      top: -BAR_HEIGHT.HEADER,
      left: 0,
      padding: 0,
      zIndex: 10,
    })
  })
})
