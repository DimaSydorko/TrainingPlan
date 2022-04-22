import * as React from 'react'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { IconButton } from '../index'
import { FlexSpaceBetween, TextOrdinary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 12,
    marginHorizontal: 'auto',
    width: '90%',
    borderRadius: 12,
    minHeight: 48,
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderStyle: 'solid',
    borderWidth: 1.5,
  },
  err: {
    backgroundColor: colors.error,
    borderColor: 'rgba(76,76,76,0.84)',
  },
})

interface ToastType {
  message: string
  onPress: () => void
  variant?: 'error'
  pressAfterTime?: number
}

export default React.memo(function Toast({ message, variant = 'error', onPress, pressAfterTime }: ToastType) {

  useEffect(() => {
    if (pressAfterTime) {
      setTimeout(onPress, pressAfterTime)
    }
  }, [pressAfterTime])

  return (
    <FlexSpaceBetween style={[
      styles.container,
      variant === 'error' ? styles.err : {},
      theme.view.shadow,
    ]}>
      <TextOrdinary>{variant === 'error' && 'Error:'} {message}</TextOrdinary>
      <IconButton iconName={icon.close} onPress={onPress} />
    </FlexSpaceBetween>
  )
})