import { getBarHeights } from '@theme/bar-heights'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'

describe('getBarHeights', () => {
  it('keeps the old bar heights without insets', () => {
    expect(getBarHeights({ top: 0, bottom: 0 })).toEqual({ header: 40, footer: 55 })
  })

  it('adds the system bar insets (edge-to-edge)', () => {
    expect(getBarHeights({ top: 24, bottom: 48 })).toEqual({
      header: BAR_HEIGHT.HEADER + 24,
      footer: BAR_HEIGHT.FOOTER + 48,
    })
  })
})
