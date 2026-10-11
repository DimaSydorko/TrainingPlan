import { getBarHeights } from '../barHeights'
import { appScreen } from '../../Utils/constants'

// Jest globals are provided at runtime by A7's jest-expo setup. They are declared here (module
// scope, so they never clash with @types/jest) to keep `tsc --noEmit` green before that lands.
declare const describe: (name: string, fn: () => void) => void
declare const it: (name: string, fn: () => void) => void
declare const expect: any

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
