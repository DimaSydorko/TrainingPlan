import * as React from 'react'
import { TouchableOpacity, ViewStyle } from 'react-native'
import { Icon } from '../icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { useAppInsets } from '@theme/insets'
import { ADD_MORE_BUTTON_FOOTER_OFFSET } from './add-more-button.constants'
import styles from './styles'

type AddMoreButtonType = {
  onPress: () => void
  color?: string
  iconColor?: string
  icon?: string
  style?: ViewStyle
  isAboveFooter?: boolean
  testID?: string
}

//zustand

export default function AddMoreButton({
  onPress,
  icon,
  iconColor,
  color,
  style,
  isAboveFooter = false,
  testID,
}: AddMoreButtonType) {
  const { colors } = useAppTheme()
  const newIconColor = iconColor || colors.background
  const newColor = color || colors.primary
  const { bottom } = useAppInsets()
  const footerOffset = isAboveFooter ? ADD_MORE_BUTTON_FOOTER_OFFSET : styles.container.bottom
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole='button'
      onPress={onPress}
      style={[styles.container, { backgroundColor: newColor, bottom: footerOffset + bottom }, style]}
    >
      <Icon name={icon || 'plus'} size={24} color={newIconColor} />
    </TouchableOpacity>
  )
}
