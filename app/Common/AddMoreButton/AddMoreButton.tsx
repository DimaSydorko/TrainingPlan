import * as React from 'react'
import { TouchableOpacity, ViewStyle } from 'react-native'
import { Icon } from '../Icon/Icon'
import { useSettings } from '../../Hooks/redux'
import styles from './styles'
import { useAppInsets } from '../../Theme/insets'

interface AddMoreButtonType {
  onPress: () => void
  color?: string
  iconColor?: string
  icon?: string
  style?: ViewStyle
}

export default function AddMoreButton({ onPress, icon, iconColor, color, style }: AddMoreButtonType) {
  const { colors } = useSettings()
  const newIconColor = iconColor || colors.background
  const newColor = color || colors.primary
  // Sits above the tab bar / AppFooter, which grow by the navigation bar inset (edge-to-edge)
  const { bottom } = useAppInsets()
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: newColor, bottom: styles.container.bottom + bottom }, style]}>
      <Icon name={icon || 'plus'} size={24} color={newIconColor} />
    </TouchableOpacity>
  )
}
