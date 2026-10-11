import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'
import { BarHeights, getBarHeights } from './barHeights'

export type { BarHeights } from './barHeights'

/** Safe-area insets plus the app's header/footer heights adjusted for them (edge-to-edge). */
export function useAppInsets(): EdgeInsets & BarHeights {
  const insets = useSafeAreaInsets()
  return { ...insets, ...getBarHeights(insets) }
}
