import { getBarHeights } from '@theme/bar-heights'
import { appScreen } from '@utils/constants'

describe('getBarHeights', () => {
  it('keeps the old bar heights without insets', () => {
    expect(getBarHeights({ top: 0, bottom: 0 })).toEqual({ header: appScreen.header, footer: appScreen.footer })
  })

  it('adds the system bar insets (edge-to-edge)', () => {
    expect(getBarHeights({ top: 24, bottom: 48 })).toEqual({
      header: appScreen.header + 24,
      footer: appScreen.footer + 48,
    })
  })
})
