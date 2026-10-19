import * as React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './loading.styles'

export default function Loading() {
  const { colors } = useAppTheme()
  return (
    <View style={[styles.bg, { backgroundColor: colors.background }]}>
      <ActivityIndicator size='large' color={colors.accent} />
    </View>
  )
}
