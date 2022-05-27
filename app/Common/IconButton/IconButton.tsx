import * as React from 'react'
import { TouchableOpacity, Vibration, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSettings } from '../../Hooks/redux'
import { VIBRATION } from '../../Utils/constants'

interface IconButtonType {
  iconName: string
  onPress: () => void
  color?: string
  size?: number
  margin?: number
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
  margin = 0,
  style
}: IconButtonType) {
  const { colors, isVibration } = useSettings()
  const newColor = color || colors.textSecondary
  const onSubmit = () => {
    if (isVibration && !disableVibration) Vibration.vibrate(VIBRATION.BUTTON)
    onPress()
  }

  return (
    <TouchableOpacity
      onPress={onSubmit}
      disabled={disabled}
      style={[
        {
          opacity: disabled ? 0.5 : 1,
          borderRadius: 50,
          marginHorizontal: margin
        },
        style
      ]}
    >
      <Icon name={iconName} color={newColor} size={size} />
    </TouchableOpacity>
  )
}
