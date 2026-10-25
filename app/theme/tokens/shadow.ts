import type { ViewStyle } from 'react-native'

const baseShadow = {
  shadowOpacity: 0.1,
  shadowRadius: 5,
  shadowOffset: { width: 4, height: 2 },
} as const satisfies ViewStyle

export const shadow = {
  card: { ...baseShadow, elevation: 3 },
  bar: { ...baseShadow, elevation: 4 },
} as const satisfies Record<string, ViewStyle>

export type Shadow = typeof shadow

export type ShadowToken = keyof Shadow
