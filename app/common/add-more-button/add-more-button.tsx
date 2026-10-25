import * as React from 'react'
import { TouchableOpacity, ViewStyle } from 'react-native'
import { Icon } from '../icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './styles'
import { useAppInsets } from '@theme/insets'

type AddMoreButtonType = {
  onPress: () => void
  color?: string
  iconColor?: string
  icon?: string
  style?: ViewStyle
  testID?: string
}

//zustand

export default function AddMoreButton({ onPress, icon, iconColor, color, style, testID }: AddMoreButtonType) {
  const { colors } = useAppTheme()
  const newIconColor = iconColor || colors.background
  const newColor = color || colors.primary
  // Sits above the tab bar / AppFooter, which grow by the navigation bar inset (edge-to-edge)
  const { bottom } = useAppInsets()
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole='button'
      onPress={onPress}
      style={[styles.container, { backgroundColor: newColor, bottom: styles.container.bottom + bottom }, style]}
    >
      <Icon name={icon || 'plus'} size={24} color={newIconColor} />
    </TouchableOpacity>
  )
}
