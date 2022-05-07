import * as React from 'react'
import { SwitchLib } from './SwitchLib'
import { useSettings } from '../../Hooks/redux'

interface MySwitchType {
  value: boolean
  disabled?: boolean
  onValueChange: () => void
  color?: string
}

export default function MySwitch({ value, disabled, onValueChange, color }: MySwitchType) {
  const { colors } = useSettings()
  const newColor = color || colors.secondPrimary

  return (
    <SwitchLib
      value={!value}
      onValueChange={onValueChange}
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
