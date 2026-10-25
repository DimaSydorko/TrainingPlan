export const radius = {
  xs: 5,
  sm: 6,
  base: 8,
  md: 10,
  lg: 16,
  round: 100,
  full: 999,
} as const satisfies Record<string, number>

export type Radius = typeof radius

export type RadiusToken = keyof Radius
