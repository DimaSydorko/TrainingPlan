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
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, lineHeight: 23 },
  body: { fontSize: fontSize.lg, fontWeight: fontWeight.medium, lineHeight: 23 },
  bodyStrong: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, lineHeight: 23 },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, lineHeight: 18 },
  link: { fontSize: fontSize.md, fontWeight: fontWeight.bold, lineHeight: 21 },
} as const satisfies Record<string, Pick<TextStyle, 'fontSize' | 'fontWeight' | 'lineHeight'>>

export type FontSizeToken = keyof typeof fontSize

export type Typography = typeof typography

export type TypographyVariant = keyof Typography
