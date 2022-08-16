import * as React from 'react'
import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

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
  toasts: (JSX.Element | boolean)[]
}

export default memo(function Toaster({ toasts }: ToasterType) {
  return (
    <View style={styles.container}>
      {toasts.map((toast, idx) => (
        <View key={idx}>{toast}</View>
      ))}
    </View>
  )
})
