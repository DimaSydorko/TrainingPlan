import { darkColors, fixedColors, lightColors, themes } from '@theme/themes'
import {
  EXERCISE_COLOR_COUNT,
  EXERCISE_COLOR_NAMES,
  exerciseColors,
  getExerciseColor,
  getExerciseColorPair,
  palette,
  radius,
  shadow,
  spacing,
  typography,
} from '@theme/tokens'

const paletteValues: string[] = Object.values(palette)

describe('palette', () => {
  it('holds unique raw color values', () => {
    expect(new Set(paletteValues).size).toBe(paletteValues.length)
  })
})

describe('theme colors', () => {
  it('gives the light and dark themes identical roles', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort())
  })

  it('builds every role from the palette', () => {
    Object.values(lightColors).forEach(color => expect(paletteValues).toContain(color))
    Object.values(darkColors).forEach(color => expect(paletteValues).toContain(color))
  })

  it('keeps the fixed roles equal in both themes', () => {
    Object.entries(fixedColors).forEach(([role, color]) => {
      expect(themes.light.colors[role as keyof typeof fixedColors]).toBe(color)
      expect(themes.dark.colors[role as keyof typeof fixedColors]).toBe(color)
    })
  })

  it('keeps the rendered values of the previous palette', () => {
    expect(fixedColors).toEqual({
      onPrimary: '#ffffff',
      shadow: '#00000030',
      staticWhite: '#ffffff',
      staticBlack: '#000000',
    })
    expect(lightColors).toMatchObject({
      primary: '#70b763',
      accent: '#ff5858',
      danger: '#fa6e6e',
      inverse: '#353535',
      surface: '#ffffff',
      surfaceElevated: '#ffffff',
      textPrimary: '#3e3e3e',
      textSecondary: '#35353580',
      background: '#f1f1f1',
      info: '#1370fc',
      disabled: '#a1a1a1',
    })
    expect(darkColors).toMatchObject({
      primary: '#3c8739',
      accent: '#f82349',
      danger: '#d73838',
      inverse: '#bbbbbb',
      surface: '#343434',
      surfaceElevated: '#2f2f2f',
      textPrimary: '#c2c2c2',
      textSecondary: 'rgba(189,189,189,0.5)',
      background: '#1f1f1f',
      info: '#1370fc',
      disabled: '#767676',
    })
  })
})

describe('exercise colors', () => {
  it('has 12 ordered entries', () => {
    expect(EXERCISE_COLOR_NAMES).toHaveLength(12)
    expect(EXERCISE_COLOR_COUNT).toBe(12)
    expect(Object.keys(exerciseColors)).toEqual([...EXERCISE_COLOR_NAMES])
  })

  it('resolves a color by index and theme', () => {
    expect(getExerciseColor(0, false)).toBe('#0e9000')
    expect(getExerciseColor(0, true)).toBe('#18b502')
    expect(getExerciseColor(3, false)).toBe('#ff2929')
    expect(getExerciseColorPair(11)).toEqual({ light: '#ff60f3', dark: '#fb9ef5' })
  })

  it('keeps the legacy index order of every exercise color', () => {
    const legacyExerciseColors = [
      ['#0e9000', '#18b502'],
      ['#70b763', '#66a757'],
      ['#00c87f', '#00c87f'],
      ['#ff2929', '#fb4545'],
      ['#ff5858', '#d34545'],
      ['#ff7b22', '#ef8941'],
      ['#f1bf00', '#ffd347'],
      ['#00adff', '#00adff'],
      ['#0217ff', '#5965fa'],
      ['#a401ff', '#cb64ff'],
      ['#ff00cc', '#d735b4'],
      ['#ff60f3', '#fb9ef5'],
    ]

    legacyExerciseColors.forEach(([light, dark], idx) => {
      expect(getExerciseColor(idx, false)).toBe(light)
      expect(getExerciseColor(idx, true)).toBe(dark)
    })
  })
})

describe('scales', () => {
  it('exposes the spacing and radius scales', () => {
    expect(spacing).toEqual({ none: 0, xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 })
    expect(radius).toMatchObject({ sm: 6, md: 10, lg: 16, full: 999 })
  })

  it('keeps the typography sizes and weights of the legacy text styles', () => {
    expect(typography.title).toMatchObject({ fontSize: 18, fontWeight: '700' })
    expect(typography.body).toMatchObject({ fontSize: 18, fontWeight: '500' })
    expect(typography.caption).toMatchObject({ fontSize: 14, fontWeight: '600' })
    expect(typography.link).toMatchObject({ fontSize: 16, fontWeight: '700' })
  })

  it('keeps the legacy shadow values', () => {
    const legacyShadow = { shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 4, height: 2 } }

    expect(shadow.card).toEqual({ ...legacyShadow, elevation: 3 })
    expect(shadow.bar).toEqual({ ...legacyShadow, elevation: 4 })
  })
})
