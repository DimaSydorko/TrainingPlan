import * as React from 'react'
import { memo, ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import { FlexSpaceBetween, TextHeader } from '@theme/parents'
import { IconButton } from '../index'
import { appScreen } from '@utils/constants'
import { SetStateType } from '@utils/types'
import { icon } from '@theme/icons'

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
  const { colors } = useAppTheme()
  const buttonColor = color || colors.textSecondary

  return (
    <FlexSpaceBetween style={[styles.container, { width: (appScreen.vw - 120) / 2 + extraWidth }]}>
      <IconButton
        size={28}
        iconName={icon.minus}
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
        iconName={icon.plus}
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
