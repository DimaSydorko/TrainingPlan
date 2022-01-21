import React from "react";
import {Switch} from 'react-native-switch';
import {colors} from "../../Theme/colors";

interface MySwitchType {
  value: boolean;
  disabled?: boolean;
  onValueChange: () => void;
}

export default function MySwitch({value, disabled, onValueChange}: MySwitchType) {
  return (
    <Switch
      value={!value}
      onValueChange={onValueChange}
      disabled={disabled}
      circleSize={25}
      circleBorderWidth={0}
      backgroundActive={`${colors.black}50`}
      backgroundInactive={`${colors.secondPrimary}50`}
      circleInActiveColor={colors.secondPrimary}
      renderActiveText={false}
      renderInActiveText={false}
    />
  )
}