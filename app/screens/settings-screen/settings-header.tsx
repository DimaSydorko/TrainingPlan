import * as React from 'react'
import { memo, ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { TextSecondary } from '../../theme/parents'
import { appScreen } from '../../utils/constants'

interface IProps {
  label: string
  children?: ReactNode
}

export default memo(function SettingsHeader({ label, children }: IProps) {
  return (
    <View style={styles.container}>
      <TextSecondary style={styles.label}>{label}</TextSecondary>
      {children}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: appScreen.vw,
  },
  label: {
    marginLeft: 10,
    marginTop: 12,
    marginBottom: 6,
  },
})
