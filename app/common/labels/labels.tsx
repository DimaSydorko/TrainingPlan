import * as React from 'react'
import { ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import Stack from '../stack/stack'
import styles from './labels.styles'

type LabelsProps = {
  labels: string[]
  style?: ViewStyle
}

export default function Labels({ style, labels }: LabelsProps) {
  const { colors } = useAppTheme()
  return (
    <Stack preset='start' style={[styles.container, style]}>
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
