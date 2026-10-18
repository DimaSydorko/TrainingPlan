import * as React from 'react'
import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
})

interface ToasterType {
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
