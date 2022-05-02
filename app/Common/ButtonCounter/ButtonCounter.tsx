import * as React from 'react'
import { useEffect, useState } from 'react'
import { FlexSpaceBetween, TextHeader } from '../../Theme/Parents'
import { IconButton } from '../index'
import { colors } from '../../Theme/colors'
import styles from './styles'

interface ButtonCounterType {
  value?: number
  onChange: (value: number) => void
  dataType?: string
  step?: number
  minValue?: number
  maxValue?: number
}

export default function ButtonCounter({
  value = 0,
  step = 1,
  onChange,
  dataType = '',
  minValue = 0,
  maxValue
}: ButtonCounterType) {
  const [count, setCount] = useState(value)

  useEffect(() => {
    onChange(count)
  }, [count])

  return (
    <FlexSpaceBetween style={styles.container}>
      <IconButton
        size={32}
        disabled={count <= minValue}
        iconName={'minus-circle-outline'}
        onPress={() => setCount(prev => (prev -= step))}
      />
      <TextHeader color={colors.secondPrimary}>
        {count}
        {dataType}
      </TextHeader>
      <IconButton
        iconName={'plus-circle-outline'}
        size={32}
        disabled={!!maxValue ? count <= maxValue : undefined}
        onPress={() => setCount(prev => (prev += step))}
      />
    </FlexSpaceBetween>
  )
}
