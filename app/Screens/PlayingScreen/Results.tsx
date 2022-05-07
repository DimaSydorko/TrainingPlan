import * as React from 'react'
import { FlexSpaceBetween, TextHeader } from '../../Theme/Parents'
import { ButtonCounter } from '../../Common'
import { useSettings } from '../../Hooks/redux'

interface ResultsI {
  type: 'repeats' | 'weight'
  onChange: (v: number) => void
  value: number
  diff: number
  step?: number
  repeats?: number
}

export default function Results({ onChange, type, value, diff, step, repeats }: ResultsI) {
  const { colors } = useSettings()
  return (
    <FlexSpaceBetween>
      <TextHeader color={colors.text}>{type === 'repeats' ? 'Repeats' : 'Weight'}</TextHeader>
      <ButtonCounter
        value={value}
        step={step}
        dataType={type === 'repeats' ? ` / ${repeats}` : ' kg'}
        extraWidth={25}
        onChange={onChange}
      >
        {diff !== 0 && (
          <TextHeader color={`${diff > 0 ? colors.primary : colors.secondPrimary}A0`}>
            {` ${diff > 0 ? '+' : ''}${diff}`}
          </TextHeader>
        )}
      </ButtonCounter>
    </FlexSpaceBetween>
  )
}
