import { View, ViewProps } from 'react-native'
import type { SpacingToken } from '@theme/tokens'
import styles from './stack.styles'

export type StackPreset = keyof typeof styles.preset

export type StackDirection = keyof typeof styles.direction

export type StackAlign = keyof typeof styles.align

export type StackJustify = keyof typeof styles.justify

export type StackProps = ViewProps & {
  preset?: StackPreset
  direction?: StackDirection
  align?: StackAlign
  justify?: StackJustify
  gap?: SpacingToken
  fullWidth?: boolean
  fill?: boolean
}

const Stack = ({
  preset,
  direction,
  align,
  justify,
  gap,
  fullWidth = false,
  fill = false,
  style,
  ...props
}: StackProps) => (
  <View
    style={[
      preset && styles.preset[preset],
      direction && styles.direction[direction],
      align && styles.align[align],
      justify && styles.justify[justify],
      gap && styles.gap[gap],
      fullWidth && styles.modifier.fullWidth,
      fill && styles.modifier.fill,
      style,
    ]}
    {...props}
  />
)

export default Stack
