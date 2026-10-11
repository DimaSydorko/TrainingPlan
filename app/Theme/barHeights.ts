import { appScreen } from '../Utils/constants'

export type BarHeights = {
  /** Stack header height including the status bar inset (the header draws behind the status bar). */
  header: number
  /** Bottom tab bar / AppFooter height including the navigation bar inset. */
  footer: number
}

/** SDK 57 apps are edge-to-edge: the app's fixed bar heights grow by the system bar insets. */
export function getBarHeights(insets: { top: number; bottom: number }): BarHeights {
  return {
    header: appScreen.header + insets.top,
    footer: appScreen.footer + insets.bottom,
  }
}
