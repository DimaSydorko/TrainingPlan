import * as React from 'react'
import { memo, ReactNode } from 'react'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import Stack from '../stack/stack'
import { IconButton } from '../index'
import { useScreen } from '@platform/screen'
import { SetStateType } from '@utils/types'
import { icon } from '@theme/icons'
import { COUNTER_ROW_GUTTER, COUNTERS_PER_ROW } from './button-counter.constants'
import styles from './button-counter.styles'

type ButtonCounterType = {
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
  const { width } = useScreen()
  const buttonColor = color || colors.textSecondary

  return (
    <Stack
      preset='spaceBetween'
      style={[styles.container, { width: (width - COUNTER_ROW_GUTTER) / COUNTERS_PER_ROW + extraWidth }]}
    >
      <IconButton
        size={28}
        iconName={icon.minus}
        color={buttonColor}
        style={[styles.button, { borderColor: buttonColor }]}
        disabled={value <= minValue}
        isRepeatOnLongPress
        onPress={() => onChange(p => (p > minValue ? p - step : p))}
      />
      <AppText variant='title' color={color || colors.accent}>
        {value}
        {dataType}
        {children}
      </AppText>
      <IconButton
        size={28}
        isRepeatOnLongPress
        iconName={icon.plus}
        color={buttonColor}
        style={[styles.button, { borderColor: buttonColor }]}
        onPress={() => onChange(p => p + step)}
      />
    </Stack>
  )
})
