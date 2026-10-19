import * as React from 'react'
import Stack from '@common/stack/stack'
import AppText from '@common/app-text/app-text'
import { ButtonCounter } from '@common'
import { useAppTheme } from '@theme/use-app-theme'
import { SetStateType } from '@utils/types'

interface ResultsI {
  type: 'repeats' | 'weight'
  onChange: SetStateType<number>
  value: number
  diff: number
  step?: number
  color?: string
  repeats?: number
}

export default function Results({ onChange, type, value, color, diff, step, repeats }: ResultsI) {
  const { colors } = useAppTheme()
  return (
    <Stack preset='spaceBetween'>
      <AppText variant='title'>{type === 'repeats' ? 'Repeats' : 'Weight'}</AppText>
      <ButtonCounter
        value={value}
        step={step}
        color={color}
        dataType={type === 'repeats' ? ` / ${repeats}` : ' kg'}
        extraWidth={25}
        onChange={onChange}
      >
        {diff !== 0 && (
          <AppText variant='title' color={`${diff > 0 ? colors.primary : colors.accent}A0`}>
            {` ${diff > 0 ? '+' : ''}${diff}`}
          </AppText>
        )}
      </ButtonCounter>
    </Stack>
  )
}
