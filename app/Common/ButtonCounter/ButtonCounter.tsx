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
  dataType = '',
  minValue = 0,
  maxValue,
  extraWidth = 0,
  children
}: ButtonCounterType) {
  const { colors } = useSettings()
  return (
    <FlexSpaceBetween style={[styles.container, { width: (screen.vw - 120) / 2 + extraWidth }]}>
      <IconButton
        size={32}
        disableVibration
        iconName={'minus-circle-outline'}
        disabled={value <= minValue}
        onPress={() => onChange(value - step)}
      />
      <TextHeader color={colors.secondPrimary}>
        {value}
        {dataType}
        {children}
      </TextHeader>
      <IconButton
        size={32}
        disableVibration
        iconName={'plus-circle-outline'}
        disabled={!!maxValue ? value <= maxValue : undefined}
        onPress={() => onChange(value + step)}
      />
    </FlexSpaceBetween>
  )
})

const styles = StyleSheet.create({
  container: {
    margin: 10
  }
})
