import * as React from 'react'
import { memo, ReactNode, useMemo } from 'react'
import { View } from 'react-native'
import AppText from '@common/app-text/app-text'
import { useScreen } from '@platform/screen'
import styles from './settings-header.styles'

type PropsType = {
  label: string
  children?: ReactNode
}

export default memo(function SettingsHeader({ label, children }: PropsType) {
  const { width } = useScreen()
  const containerStyle = useMemo(() => ({ width }), [width])

  return (
    <View style={containerStyle}>
      <AppText variant='caption' tone='secondary' style={styles.label}>
        {label}
      </AppText>
      {children}
    </View>
  )
})
