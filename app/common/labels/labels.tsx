import * as React from 'react'
import { ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import Stack from '../stack/stack'

interface IProps {
  labels: string[]
  style?: ViewStyle
}

export default function Labels({ style, labels }: IProps) {
  const { colors } = useAppTheme()
  return (
    <Stack preset='start' style={[{ flexWrap: 'wrap' }, style]}>
      {labels
        .filter(l => !!l)
        .map((label, idx) => (
          <AppText variant='caption' key={idx} color={colors.accent + 'A0'}>
            #{label}{' '}
          </AppText>
        ))}
    </Stack>
  )
}
