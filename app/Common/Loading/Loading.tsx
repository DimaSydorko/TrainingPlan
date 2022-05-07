import * as React from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native'
import { useSettings } from '../../Hooks/redux'

const styles = StyleSheet.create({
  bg: {
    zIndex: 1000,
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default function Loading() {
  const { colors } = useSettings()
  return (
    <SafeAreaView style={[styles.bg, { backgroundColor: colors.background }]}>
      <ActivityIndicator size='large' color={colors.secondPrimary} />
    </SafeAreaView>
  )
}
