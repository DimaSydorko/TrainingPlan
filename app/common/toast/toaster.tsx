import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styles from './toaster.styles'

type ToasterType = {
  toasts: (React.JSX.Element | boolean)[]
}

export default memo(function Toaster({ toasts }: ToasterType) {
  // Toasts cover the header; keep them below the status bar / notch (edge-to-edge)
  const { top } = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: top }]} pointerEvents='box-none'>
      {toasts.map((toast, idx) => (
        <View key={idx}>{toast}</View>
      ))}
    </View>
  )
})
