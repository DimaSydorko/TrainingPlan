import * as React from 'react'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { IconButton } from '../index'
import { FlexSpaceBetween, TextOrdinary } from '../../Theme/Parents'
import { useSettings } from '../../Hooks/redux'
import { icon } from '../../Theme/icons'
import { theme } from '../../Theme/theme'
import { colorsFixed } from '../../Theme/colors'

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 12,
    marginHorizontal: '5%',
    width: '90%',
    borderRadius: 12,
    minHeight: 48,
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderStyle: 'solid',
    borderWidth: 1.5
  }
})

interface ToastType {
  message: string
  onPress: () => void
  variant?: 'error'
  pressAfterTime?: number
}

export default React.memo(function Toast({ message, variant = 'error', onPress, pressAfterTime }: ToastType) {
  const { colors } = useSettings()

  useEffect(() => {
    if (pressAfterTime) {
      setTimeout(onPress, pressAfterTime)
    }
  }, [pressAfterTime])

  return (
    <FlexSpaceBetween
      style={[
        styles.container,
        variant === 'error'
          ? {
              backgroundColor: colors.error,
              borderColor: colors.black
            }
          : {},
        {
          shadowColor: colorsFixed.shadow
        },
        theme.view.shadow
      ]}
    >
      <TextOrdinary>
        {variant === 'error' && 'Error:'} {message}
      </TextOrdinary>
      <IconButton iconName={icon.close} onPress={onPress} />
    </FlexSpaceBetween>
  )
})
