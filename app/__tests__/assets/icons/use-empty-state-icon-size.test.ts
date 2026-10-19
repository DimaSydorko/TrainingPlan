import { getEmptyStateIconSize } from '@assets/icons/use-empty-state-icon-size'

describe('getEmptyStateIconSize', () => {
  it('sizes the icon from the window width and leaves room for five headers', () => {
    expect(getEmptyStateIconSize({ width: 390, height: 844 })).toEqual({
      iconWidth: 340,
      iconHeight: 390,
      containerHeight: 644,
    })
  })

  it('uses an explicit icon size when given', () => {
    expect(getEmptyStateIconSize({ width: 390, height: 844 }, 200)).toMatchObject({ iconWidth: 150, iconHeight: 200 })
  })
})
