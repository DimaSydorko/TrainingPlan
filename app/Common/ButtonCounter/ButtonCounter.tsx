import * as React from 'react'
import { memo, ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { FlexSpaceBetween, TextHeader } from '../../Theme/Parents'
import { IconButton } from '../index'
import { screen } from '../../Utils/constants'
import { SetStateType } from '../../Utils/types'

interface ButtonCounterType {
  value: number
  onChange: SetStateType<number>
  dataType?: string
  color?: string
  step?: number
  minValue?: number
  extraWidth?: number
  children?: ReactNode
}

export default memo(function ButtonCounter({
  value,
  step = 1,
  onChange,
  color,
  dataType = '',
  minValue = 0,
  extraWidth = 0,
  children,
}: ButtonCounterType) {
  const { colors } = useSettings()
  const buttonColor = color || colors.textSecondary

  return (
    <FlexSpaceBetween style={[styles.container, { width: (screen.vw - 120) / 2 + extraWidth }]}>
      <IconButton
        size={28}
        iconName='minus'
        color={buttonColor}
        style={[styles.button, { borderColor: buttonColor }]}
        disabled={value <= minValue}
        isRepeatOnLongPress
        onPress={() => onChange(p => (p > minValue ? p - step : p))}
      />
      <TextHeader color={color || colors.secondPrimary}>
        {value}
        {dataType}
        {children}
      </TextHeader>
      <IconButton
        size={28}
        isRepeatOnLongPress
        iconName='plus'
        color={buttonColor}
        style={[styles.button, { borderColor: buttonColor }]}
        onPress={() => onChange(p => p + step)}
      />
    </FlexSpaceBetween>
  )
})

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  button: {
    borderWidth: 2,
  },
})
