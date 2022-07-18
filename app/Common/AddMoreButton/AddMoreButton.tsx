import * as React from 'react'
import { TouchableOpacity, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSettings } from '../../Hooks/redux'
import styles from './styles'

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
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: newColor }, style]}>
      <Icon name={icon || 'plus'} size={24} color={newIconColor} />
    </TouchableOpacity>
  )
}
