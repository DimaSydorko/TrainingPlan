import * as React from 'react'
import { useEffect, useState } from 'react'
import { TouchableOpacity, Vibration, ViewStyle } from 'react-native'
import { Icon } from '../icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { VIBRATION } from '@utils/constants'
import styles from './icon-button.styles'

type IconButtonType = {
  iconName: string
  onPress: () => void
  isRepeatOnLongPress?: boolean
  color?: string
  size?: number
  margin?: number
  disabled?: boolean
  disableVibration?: boolean
  style?: ViewStyle | ViewStyle[]
  testID?: string
}

export default function IconButton({
  iconName,
  onPress,
  isRepeatOnLongPress = false,
  size = 24,
  disabled = false,
  disableVibration = false,
  color,
  margin = 0,
  style,
  testID,
}: IconButtonType) {
  const { colors } = useAppTheme()
  const isVibration = useSettingsStore(state => state.isVibration)
  const newColor = color || colors.textSecondary
  const [intervalID, setIntervalID] = useState<any>(null)

  useEffect(() => () => clearTimeout(intervalID), [])

  const startInterval = () => {
    setIntervalID(
      setInterval(() => {
        if (isVibration && !disableVibration) Vibration.vibrate(VIBRATION.BUTTON / 2)
        onPress()
      }, 180)
    )
  }
  const stopInterval = () => {
    clearInterval(intervalID)
    setIntervalID(-1)
  }

  const onSubmit = () => {
    if (isVibration && !disableVibration) Vibration.vibrate(VIBRATION.BUTTON)
    onPress()
  }

  return (
    <TouchableOpacity
      onPress={onSubmit}
      onLongPress={isRepeatOnLongPress ? startInterval : undefined}
      onPressOut={!!intervalID ? stopInterval : undefined}
      disabled={disabled}
      testID={testID}
      accessibilityRole='button'
      accessibilityState={{ disabled }}
      style={[styles.button, { opacity: disabled ? 0.5 : 1, marginHorizontal: margin }, style]}
    >
      <Icon name={iconName} color={newColor} size={size} />
    </TouchableOpacity>
  )
}
