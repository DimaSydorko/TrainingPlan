import { render } from '@testing-library/react-native'
import NoDataIcon from '@assets/icons/no-data-icon'
import NoSignalIcon from '@assets/icons/no-signal-icon'
import { darkColors, lightColors } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { illustration } from '@theme/tokens'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

const mockRenderedXml: string[] = []

jest.mock('react-native-svg', () => ({
  SvgXml: ({ xml }: { xml: string }) => {
    mockRenderedXml.push(xml)
    return null
  },
}))

const renderXml = async (ui: React.ReactElement) => {
  mockRenderedXml.length = 0
  await render(ui)
  return mockRenderedXml[mockRenderedXml.length - 1]
}

describe('empty-state icons', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
  })

  it('paints the alert parts with the illustration alert color by default', async () => {
    expect(await renderXml(<NoDataIcon />)).toContain(`fill='${illustration.alert}'`)
    expect(await renderXml(<NoSignalIcon />)).toContain(`fill='${illustration.alert}'`)
  })

  it('accepts a custom highlight color', async () => {
    expect(await renderXml(<NoDataIcon color='blue' />)).toContain("fill='blue'")
    expect(await renderXml(<NoSignalIcon color='blue' />)).toContain("fill='blue'")
  })

  it('uses the light theme colors for the theme-dependent parts', async () => {
    expect(await renderXml(<NoDataIcon />)).toContain(`fill='${lightColors.background}'`)
  })

  it('uses the dark theme colors for the theme-dependent parts', async () => {
    useSettingsStore.setState({ themeMode: THEME_MODE.DARK })

    expect(await renderXml(<NoDataIcon />)).toContain(`fill='${darkColors.background}'`)
  })
})
