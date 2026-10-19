export const BREAKPOINT = {
  COMPACT: 'compact',
  MEDIUM: 'medium',
  EXPANDED: 'expanded',
} as const

export type Breakpoint = (typeof BREAKPOINT)[keyof typeof BREAKPOINT]

export const BREAKPOINT_MIN_WIDTH = {
  MEDIUM: 600,
  EXPANDED: 840,
} as const
