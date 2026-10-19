import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { BREAKPOINT, BREAKPOINT_MIN_WIDTH, Breakpoint } from './screen.constants'

export type { Breakpoint } from './screen.constants'

export type ScreenSize = {
  width: number
  height: number
}

export type Screen = ScreenSize & {
  breakpoint: Breakpoint
}

export function useScreen(): Screen {
  const { width, height } = useWindowDimensions()

  return useMemo(() => getScreen({ width, height }), [width, height])
}

export function getScreen({ width, height }: ScreenSize): Screen {
  return { width, height, breakpoint: getBreakpoint(width) }
}

export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINT_MIN_WIDTH.EXPANDED) return BREAKPOINT.EXPANDED
  if (width >= BREAKPOINT_MIN_WIDTH.MEDIUM) return BREAKPOINT.MEDIUM
  return BREAKPOINT.COMPACT
}
