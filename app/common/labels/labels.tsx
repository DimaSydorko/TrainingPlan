import * as React from 'react'
import { ViewStyle } from 'react-native'
import { useSettings } from '@hooks/redux'
import { FlexStart, TextSecondary } from '@theme/parents'

interface IProps {
  labels: string[]
  style?: ViewStyle
}

export default function Labels({ style, labels }: IProps) {
  const { colors } = useSettings()
  return (
    <FlexStart style={[{ flexWrap: 'wrap' }, style]}>
      {labels
        .filter(l => !!l)
        .map((label, idx) => (
          <TextSecondary key={idx} color={colors.secondPrimary + 'A0'}>
            #{label}{' '}
          </TextSecondary>
        ))}
    </FlexStart>
  )
}
