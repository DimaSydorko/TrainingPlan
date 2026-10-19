import * as React from 'react'
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import { colorsFixed } from '@theme/colors'
import styles from './styles'
import { appScreen } from '@utils/constants'

interface ConfirmButtonType {
  header: string
  onPress: () => void
  headerStyle?: TextStyle
  disabled?: boolean
  isFooter?: boolean
  color?: string
  style?: ViewStyle
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
        isFooter ? { marginTop: 0, width: '90%', height: appScreen.footer - 16, paddingVertical: 0 } : {},
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
      <Text style={[styles.buttonTitle, { color: colorsFixed.white }, headerStyle]}>{header}</Text>
    </TouchableOpacity>
  )
}
