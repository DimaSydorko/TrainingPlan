import * as React from 'react'
import { memo, ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from '@common/app-text/app-text'
import { useScreen } from '@platform/screen'
import { spacing } from '@theme/tokens'

interface IProps {
  label: string
  children?: ReactNode
}

export default memo(function SettingsHeader({ label, children }: IProps) {
  const { width } = useScreen()

  return (
    <View style={{ width }}>
      <AppText variant='caption' tone='secondary' style={styles.label}>
        {label}
      </AppText>
      {children}
    </View>
  )
})

const styles = StyleSheet.create({
  label: {
    marginLeft: 10,
    marginTop: spacing.md,
    marginBottom: 6,
  },
})
