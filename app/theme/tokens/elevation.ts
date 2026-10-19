import type { ViewStyle } from 'react-native'

export const elevation = {
  card: { boxShadow: '4px 2px 10px rgba(0, 0, 0, 0.1)' },
  header: { boxShadow: '4px 2px 10px rgba(0, 0, 0, 0.1)' },
} as const satisfies Record<string, Pick<ViewStyle, 'boxShadow'>>

export type Elevation = typeof elevation

export type ElevationToken = keyof Elevation
