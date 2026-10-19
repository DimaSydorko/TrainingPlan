import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import Screen from '@common/screen/screen'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { lightColors } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

const getScrollView = () => {
  const [scrollView] = screen.getByTestId('screen').children

  if (typeof scrollView === 'string') throw new Error('Expected a scroll view')
  return scrollView
}

describe('Screen', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
  })

  it('fills the screen with the theme background and keeps content above the tab bar', async () => {
    await render(
      <Screen testID='screen' style={{ paddingTop: 4 }}>
        <Text>Content</Text>
      </Screen>
    )

    expect(screen.getByText('Content')).toBeOnTheScreen()
    expect(StyleSheet.flatten(screen.getByTestId('screen').props.style)).toEqual({
      flex: 1,
      alignItems: 'center',
      backgroundColor: lightColors.background,
      paddingBottom: BAR_HEIGHT.FOOTER,
      paddingTop: 4,
    })
  })

  it('scrolls by default', async () => {
    await render(<Screen testID='screen' />)

    expect(getScrollView().props.scrollEnabled).toBe(true)
  })

  it('disables scrolling with scrollDisabled', async () => {
    await render(<Screen testID='screen' scrollDisabled />)

    expect(getScrollView().props.scrollEnabled).toBe(false)
  })
})
