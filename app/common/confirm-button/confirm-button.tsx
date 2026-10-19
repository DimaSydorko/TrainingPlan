import * as React from 'react'
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './styles'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'

interface ConfirmButtonType {
  header: string
  onPress: () => void
  headerStyle?: TextStyle
  disabled?: boolean
  isFooter?: boolean
  color?: string
  style?: StyleProp<ViewStyle>
  testID?: string
}

export default function ConfirmButton({
  onPress,
  header,
  headerStyle,
  color,
  isFooter,
  style,
  disabled = false,
  testID,
}: ConfirmButtonType) {
  const { colors } = useAppTheme()
  const newColor = color || colors.primary
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFooter ? { marginTop: 0, width: '90%', height: BAR_HEIGHT.FOOTER - 16, paddingVertical: 0 } : {},
        {
          backgroundColor: disabled ? colors.disabled : newColor,
          opacity: disabled ? 0.8 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.5}
      disabled={disabled}
      testID={testID}
      accessibilityRole='button'
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.buttonTitle, { color: colors.onPrimary }, headerStyle]}>{header}</Text>
    </TouchableOpacity>
  )
}
