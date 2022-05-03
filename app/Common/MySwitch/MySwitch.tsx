import * as React from 'react'
import { SwitchLib } from './SwitchLib'
import { colors } from '../../Theme/colors'

interface MySwitchType {
  value: boolean
  disabled?: boolean
  onValueChange: () => void
  color?: string
}

export default function MySwitch({ value, disabled, onValueChange, color = colors.secondPrimary }: MySwitchType) {
  return (
    <SwitchLib
      value={!value}
      onValueChange={onValueChange}
      disabled={disabled}
      circleSize={25}
      circleBorderWidth={0}
      backgroundActive={`${colors.black}50`}
      backgroundInactive={`${color}50`}
      circleInActiveColor={color}
      renderActiveText={false}
      renderInActiveText={false}
    />
  )
}
