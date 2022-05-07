import * as React from 'react'
import { TouchableOpacity, Vibration, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSettings } from '../../Hooks/redux'
import { settings } from '../../Utils/constants'

interface IconButtonType {
  iconName: string
  onPress: () => void
  color?: string
  size?: number
  disabled?: boolean
  disableVibration?: boolean
  style?: ViewStyle | ViewStyle[]
}

export default function IconButton({
  iconName,
  onPress,
  size = 24,
  disabled = false,
  disableVibration = false,
  color,
  style
}: IconButtonType) {
  const { colors } = useSettings()
  const newColor = color || colors.textSecondary
  const onSubmit = () => {
    settings.isVibration && !disableVibration && Vibration.vibrate(25)
    onPress()
  }

  return (
    <TouchableOpacity
      onPress={onSubmit}
      disabled={disabled}
      style={[
        {
          opacity: disabled ? 0.5 : 1,
          borderRadius: 50
        },
        style
      ]}
    >
      <Icon name={iconName} color={newColor} size={size} />
    </TouchableOpacity>
  )
}
