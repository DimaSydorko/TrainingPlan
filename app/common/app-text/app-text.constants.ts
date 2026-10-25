import type { ThemeColors } from '@theme/themes'

export const APP_TEXT_MAX_FONT_SIZE_MULTIPLIER = 1.3

export const APP_TEXT_TONE_COLOR = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  danger: 'danger',
  accent: 'accent',
  inverse: 'inverse',
  onPrimary: 'onPrimary',
} as const satisfies Record<string, keyof ThemeColors>

export type AppTextTone = keyof typeof APP_TEXT_TONE_COLOR
