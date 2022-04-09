import React, { useEffect, useState } from 'react'
import { FlexSpaceBetween, TextHeader } from '../../Theme/Parents'
import { IconButton } from '../index'
import { colors } from '../../Theme/colors'
import styles from './styles'

interface ButtonCounterType {
  value?: number;
  onChange: (value: number) => void;
  dataType?: string;
  step?: number;
}

export default function ButtonCounter({ value = 0, step = 1, onChange, dataType = '' }: ButtonCounterType) {
  const [count, setCount] = useState(value)

  useEffect(() => {
    onChange(count)
  }, [count])

  return (
    <FlexSpaceBetween style={styles.container}>
      <IconButton
        size={32}
        disabled={count <= 0}
        iconName={'minus-circle-outline'}
        onPress={() => setCount(val => val -= step)}
      />
      <TextHeader color={colors.secondPrimary}>{count}{dataType}</TextHeader>
      <IconButton iconName={'plus-circle-outline'} size={32} onPress={() => setCount(val => val += step)} />
    </FlexSpaceBetween>
  )
}