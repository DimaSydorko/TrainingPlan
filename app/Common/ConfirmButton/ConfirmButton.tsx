import * as React from 'react'
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { colors } from '../../Theme/colors'
import styles from './styles'

interface ConfirmButtonType {
  header: string;
  onPress: () => void;
  headerStyle?: TextStyle;
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
}

export default function ConfirmButton({
  onPress,
  header,
  headerStyle,
  color = colors.primary,
  style,
  disabled = false,
}: ConfirmButtonType) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.disabled : color,
          opacity: disabled ? 0.8 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.5}
      disabled={disabled}
    >
      <Text style={[styles.buttonTitle, headerStyle]}>{header}</Text>
    </TouchableOpacity>
  )
}

