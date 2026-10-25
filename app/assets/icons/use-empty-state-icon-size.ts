import { useScreen } from '@platform/screen'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { EMPTY_STATE_ICON } from './empty-state-icon.constants'

export type EmptyStateIconSize = {
  iconWidth: number
  iconHeight: number
  containerHeight: number
}

export function useEmptyStateIconSize(size?: number): EmptyStateIconSize {
  const { width, height } = useScreen()

  return getEmptyStateIconSize({ width, height }, size)
}

export function getEmptyStateIconSize(
  screen: { width: number; height: number },
  size: number = screen.width
): EmptyStateIconSize {
  return {
    iconWidth: size - EMPTY_STATE_ICON.WIDTH_GUTTER,
    iconHeight: size,
    containerHeight: screen.height - BAR_HEIGHT.HEADER * EMPTY_STATE_ICON.RESERVED_HEADER_COUNT,
  }
}
