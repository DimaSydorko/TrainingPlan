import * as React from 'react'
import { memo, ReactNode } from 'react'
import { useSettings } from '../../Hooks/redux'
import { FlexSpaceBetween, TextHeader } from '../../Theme/Parents'
import { IconButton } from '../index'
import { screen } from '../../Utils/constants'
import { StyleSheet } from 'react-native'

interface ButtonCounterType {
  value: number
  onChange: (value: number) => void
  dataType?: string
  color?: string
  step?: number
  minValue?: number
  maxValue?: number
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
  maxValue,
  extraWidth = 0,
  children,
}: ButtonCounterType) {
  const { colors } = useSettings()
  const buttonColor = color || colors.textSecondary
  return (
    <FlexSpaceBetween style={[styles.container, { width: (screen.vw - 120) / 2 + extraWidth }]}>
      <IconButton
        size={36}
        disableVibration
        iconName='minus'
        color={buttonColor}
        style={[styles.button, { borderColor: buttonColor }]}
        disabled={value <= minValue}
        onPress={() => onChange(value - step)}
      />
      <TextHeader color={color || colors.secondPrimary}>
        {value}
        {dataType}
        {children}
      </TextHeader>
      <IconButton
        size={36}
        disableVibration
        iconName='plus'
        color={buttonColor}
        style={[styles.button, { borderColor: buttonColor }]}
        disabled={!!maxValue ? value <= maxValue : undefined}
        onPress={() => onChange(value + step)}
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
