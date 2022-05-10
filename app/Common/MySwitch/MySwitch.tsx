import * as React from 'react'
import { SwitchLib } from './SwitchLib'
import { useSettings } from '../../Hooks/redux'
import { Vibration } from 'react-native'
import { VIBRATION } from '../../Utils/constants'

interface MySwitchType {
  value: boolean
  disabled?: boolean
  disableVibration?: boolean
  onValueChange: () => void
  color?: string
}

export default function MySwitch({ value, disabled, disableVibration, onValueChange, color }: MySwitchType) {
  const { colors, isVibration } = useSettings()
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
    />
  )
}
