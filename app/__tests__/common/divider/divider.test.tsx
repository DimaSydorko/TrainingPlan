import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import Divider from '@common/divider/divider'
import { lightColors } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

const getDividerStyle = () => StyleSheet.flatten(screen.getByTestId('divider').props.style)

describe('Divider', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
  })

  it('draws a solid accent line by default', async () => {
    await render(<Divider testID='divider' />)

    expect(getDividerStyle()).toEqual({
      width: '100%',
      borderStyle: 'solid',
      borderBottomColor: lightColors.accent,
      borderBottomWidth: 2,
    })
  })

  it('supports a dashed line with a custom color and width', async () => {
    await render(<Divider testID='divider' isDashed color='blue' width={1} />)

    expect(getDividerStyle()).toMatchObject({ borderStyle: 'dashed', borderBottomColor: 'blue', borderBottomWidth: 1 })
  })
})
