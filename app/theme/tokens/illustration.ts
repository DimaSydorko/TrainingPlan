import { palette } from './palette'

export const illustration = {
  outline: palette.slate700,
  hair: palette.slate800,
  skin: palette.rose500,
  skinShade: palette.rose450,
  skinLight: palette.peach200,
  skinLighter: palette.peach250,
  alert: palette.red450,
} as const satisfies Record<string, string>

export type Illustration = typeof illustration

export type IllustrationToken = keyof Illustration
