import * as React from 'react'
import ScrollPicker from 'react-native-scroll-picker-wheel'
import { useSettings } from '../../Hooks/redux'

interface SwipeSelectorType {
  onChange: (number: number) => void
  value?: number
  step?: number
  maxValue?: number
}

export default function SwipeSelector({ onChange, value = 0, step = 1, maxValue = 60 }: SwipeSelectorType) {
  const { colors } = useSettings()
  let list: string[] = []

  for (let i = 0; i < maxValue; i += step) {
    list.push('' + i)
  }

  return (
    <ScrollPicker
      dataSource={list}
      selectedIndex={value / step}
      onValueChange={(data, idx) => onChange(idx * step)}
      itemHeight={50}
      wrapperWidth={50}
      wrapperHeight={150}
      highlightBorderWidth={1}
      wrapperBackground={colors.background}
      highlightColor={colors.white}
      activeItemColor={colors.secondPrimary}
      itemColor={colors.menu}
    />
  )
}
