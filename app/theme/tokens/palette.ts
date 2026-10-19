export const palette = {
  white: '#ffffff',
  black: '#000000',
  blackAlpha19: '#00000030',

  grey100: '#f1f1f1',
  grey300: '#c2c2c2',
  grey325Alpha50: 'rgba(189,189,189,0.5)',
  grey350: '#bbbbbb',
  grey400: '#a1a1a1',
  grey500: '#767676',
  grey700: '#3e3e3e',
  grey750: '#353535',
  grey750Alpha50: '#35353580',
  grey800: '#343434',
  grey850: '#2f2f2f',
  grey900: '#1f1f1f',

  green300: '#70b763',
  green400: '#66a757',
  green500: '#18b502',
  green600: '#3c8739',
  green700: '#0e9000',
  mint500: '#00c87f',

  coral300: '#fa6e6e',
  coral400: '#ff5858',
  coral600: '#d34545',
  red400: '#fb4545',
  red500: '#ff2929',
  red600: '#f82349',
  red700: '#d73838',

  orange400: '#ef8941',
  orange500: '#ff7b22',
  yellow300: '#ffd347',
  yellow500: '#f1bf00',

  sky500: '#00adff',
  blue500: '#1370fc',
  indigo400: '#5965fa',
  indigo600: '#0217ff',

  purple400: '#cb64ff',
  purple600: '#a401ff',
  magenta500: '#ff00cc',
  magenta600: '#d735b4',
  pink200: '#fb9ef5',
  pink400: '#ff60f3',
} as const

export type Palette = typeof palette

export type PaletteColor = keyof Palette
