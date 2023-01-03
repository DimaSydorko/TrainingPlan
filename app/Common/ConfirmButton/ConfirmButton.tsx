import * as React from 'react'
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { colorsFixed } from '../../Theme/colors'
import styles from './styles'
import { appScreen } from '../../Utils/constants'

interface ConfirmButtonType {
  header: string
  onPress: () => void
  headerStyle?: TextStyle
  disabled?: boolean
  isFooter?: boolean
  color?: string
  style?: ViewStyle
}

export default function ConfirmButton({
  onPress,
  header,
  headerStyle,
  color,
  isFooter,
  style,
  disabled = false,
}: ConfirmButtonType) {
  const { colors } = useSettings()
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
    >
      <Text style={[styles.buttonTitle, { color: colorsFixed.white }, headerStyle]}>{header}</Text>
    </TouchableOpacity>
  )
}
