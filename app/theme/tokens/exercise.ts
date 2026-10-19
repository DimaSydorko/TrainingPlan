import { palette } from './palette'

export type ExerciseColorPair = {
  light: string
  dark: string
}

export const EXERCISE_COLOR_NAMES = [
  'forest',
  'leaf',
  'mint',
  'red',
  'coral',
  'orange',
  'yellow',
  'sky',
  'blue',
  'purple',
  'magenta',
  'pink',
] as const

export type ExerciseColorName = (typeof EXERCISE_COLOR_NAMES)[number]

export const exerciseColors = {
  forest: { light: palette.green700, dark: palette.green500 },
  leaf: { light: palette.green300, dark: palette.green400 },
  mint: { light: palette.mint500, dark: palette.mint500 },
  red: { light: palette.red500, dark: palette.red400 },
  coral: { light: palette.coral400, dark: palette.coral600 },
  orange: { light: palette.orange500, dark: palette.orange400 },
  yellow: { light: palette.yellow500, dark: palette.yellow300 },
  sky: { light: palette.sky500, dark: palette.sky500 },
  blue: { light: palette.indigo600, dark: palette.indigo400 },
  purple: { light: palette.purple600, dark: palette.purple400 },
  magenta: { light: palette.magenta500, dark: palette.magenta600 },
  pink: { light: palette.pink400, dark: palette.pink200 },
} as const satisfies Record<ExerciseColorName, ExerciseColorPair>

export const EXERCISE_COLOR_COUNT = EXERCISE_COLOR_NAMES.length

export const getExerciseColorPair = (colorIdx: number): ExerciseColorPair =>
  exerciseColors[EXERCISE_COLOR_NAMES[colorIdx]]

export const getExerciseColor = (colorIdx: number, isDark: boolean): string =>
  getExerciseColorPair(colorIdx)[isDark ? 'dark' : 'light']
