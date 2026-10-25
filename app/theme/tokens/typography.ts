import type { TextStyle } from 'react-native'

export const fontSize = {
  sm: 14,
  md: 16,
  lg: 18,
} as const satisfies Record<string, number>

export const fontWeight = {
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>

export const typography = {
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  body: { fontSize: fontSize.lg, fontWeight: fontWeight.medium },
  bodyStrong: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  link: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
} as const satisfies Record<string, Pick<TextStyle, 'fontSize' | 'fontWeight'>>

export type FontSizeToken = keyof typeof fontSize

export type Typography = typeof typography

export type TypographyVariant = keyof Typography
