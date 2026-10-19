import * as React from 'react'
import { ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import { FlexStart, TextSecondary } from '@theme/parents'

interface IProps {
  labels: string[]
  style?: ViewStyle
}

export default function Labels({ style, labels }: IProps) {
  const { colors } = useAppTheme()
  return (
    <FlexStart style={[{ flexWrap: 'wrap' }, style]}>
      {labels
        .filter(l => !!l)
        .map((label, idx) => (
          <TextSecondary key={idx} color={colors.accent + 'A0'}>
            #{label}{' '}
          </TextSecondary>
        ))}
    </FlexStart>
  )
}
