import * as React from 'react'
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import styles from './styles'
import { colorsFixed } from '../../Theme/colors'

interface ConfirmButtonType {
  header: string
  onPress: () => void
  headerStyle?: TextStyle
  disabled?: boolean
  color?: string
  style?: ViewStyle
}

export default function ConfirmButton({
  onPress,
  header,
  headerStyle,
  color,
  style,
  disabled = false
}: ConfirmButtonType) {
  const { colors } = useSettings()
  const newColor = color || colors.primary
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.disabled : newColor,
          opacity: disabled ? 0.8 : 1
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.5}
      disabled={disabled}
    >
      <Text style={[styles.buttonTitle, { color: colorsFixed.buttonText }, headerStyle]}>{header}</Text>
    </TouchableOpacity>
  )
}
