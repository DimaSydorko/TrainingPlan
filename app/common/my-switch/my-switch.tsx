import * as React from 'react'
import { SwitchLib } from './switch-lib'
import { useAppTheme } from '@theme/use-app-theme'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { Vibration } from 'react-native'
import { VIBRATION } from '@utils/constants'

interface MySwitchType {
  value: boolean
  disabled?: boolean
  disableVibration?: boolean
  onValueChange: () => void
  color?: string
  testID?: string
}

export default function MySwitch({ value, disabled, disableVibration, onValueChange, color, testID }: MySwitchType) {
  const { colors } = useAppTheme()
  const isVibration = useSettingsStore(state => state.isVibration)
  const newColor = color || colors.secondPrimary

  const onSwitch = () => {
    if (isVibration && !disableVibration) Vibration.vibrate(VIBRATION.BUTTON)
    onValueChange()
  }

  return (
    <SwitchLib
      value={!value}
      onValueChange={onSwitch}
      disabled={disabled}
      circleSize={25}
      circleBorderWidth={0}
      circleActiveColor={colors.white}
      backgroundActive={`${colors.black}50`}
      backgroundInactive={`${newColor}50`}
      circleInActiveColor={newColor}
      renderActiveText={false}
      renderInActiveText={false}
      testID={testID}
      accessibilityRole='switch'
      // SwitchLib's value is inverted for styling; the setting itself is `value`
      accessibilityState={{ checked: !!value, disabled: !!disabled }}
    />
  )
}
