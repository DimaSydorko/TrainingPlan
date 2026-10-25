import * as React from 'react'
import { StyleProp, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import styles from './styles'

type ConfirmButtonType = {
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
        isFooter && styles.footerButton,
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
      <AppText variant='link' color={colors.onPrimary} style={headerStyle}>
        {header}
      </AppText>
    </TouchableOpacity>
  )
}
