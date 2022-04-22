import * as React from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native'
import { colors } from '../../Theme/colors'

const styles = StyleSheet.create({
  bg: {
    backgroundColor: colors.background,
    zIndex: 1000,
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default function Loading() {
  return (
    <SafeAreaView style={styles.bg}>
      <ActivityIndicator size='large' color={colors.secondPrimary} />
    </SafeAreaView>
  )
}