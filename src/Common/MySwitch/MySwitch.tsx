import React from 'react'
import { Switch } from 'react-native-switch'
import { colors } from '../../Theme/colors'

interface MySwitchType {
  value: boolean;
  disabled?: boolean;
  onValueChange: () => void;
  color?: string;
}

export default function MySwitch({ value, disabled, onValueChange, color = colors.secondPrimary }: MySwitchType) {
  return (
    <Switch
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