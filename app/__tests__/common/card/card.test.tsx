import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import Card from '@common/card/card'
import { CARD_ACCENT_BORDER_WIDTH } from '@common/card/card.constants'
import { LAYOUT_GUTTER } from '@theme/layout.constants'
import { lightColors } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

const mockWindowDimensions = jest.fn()

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockWindowDimensions(),
}))

const getCardStyle = () => StyleSheet.flatten(screen.getByTestId('card').props.style)

describe('Card', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
    mockWindowDimensions.mockReturnValue({ width: 400, height: 800, scale: 2, fontScale: 1 })
  })

  it('keeps the card look and sizes itself to the window width', async () => {
    await render(<Card testID='card' />)

    expect(getCardStyle()).toEqual({
      backgroundColor: lightColors.surface,
      shadowColor: lightColors.shadow,
      padding: 6,
      paddingLeft: 8,
      borderRadius: 10,
      margin: 2,
      width: 400 - LAYOUT_GUTTER.CARD,
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 4, height: 2 },
      elevation: 3,
    })
  })

  it('follows window size changes', async () => {
    mockWindowDimensions.mockReturnValue({ width: 900, height: 600, scale: 2, fontScale: 1 })

    await render(<Card testID='card' />)

    expect(getCardStyle().width).toBe(900 - LAYOUT_GUTTER.CARD)
  })

  it('draws an accent border on the left when borderLeftColor is set', async () => {
    await render(<Card testID='card' borderLeftColor='green' style={{ margin: 0 }} />)

    expect(getCardStyle()).toMatchObject({
      borderLeftColor: 'green',
      borderLeftWidth: CARD_ACCENT_BORDER_WIDTH,
      margin: 0,
    })
  })

  it('has no accent border by default', async () => {
    await render(<Card testID='card' />)

    expect(getCardStyle()).not.toHaveProperty('borderLeftWidth')
  })
})
