import type { TextStyle, ViewStyle } from 'react-native'
import type { StackNavigationOptions } from '@react-navigation/stack'
import { BAR_HEIGHT } from './bar-heights.constants'
import { shadow } from './tokens/shadow'

export const HEADER_BAR_STYLE = {
  height: BAR_HEIGHT.HEADER,
  ...shadow.bar,
} as const satisfies ViewStyle

export const HEADER_TITLE_STYLE = {
  fontWeight: 'bold',
} as const satisfies TextStyle

export const BASE_SCREEN_OPTIONS = {
  headerTitleAlign: 'center',
  headerTitleStyle: HEADER_TITLE_STYLE,
} as const satisfies StackNavigationOptions
