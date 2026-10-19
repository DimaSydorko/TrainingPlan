import * as React from 'react'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Icon } from '../icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { IconButton } from '../index'
import { appScreen } from '@utils/constants'
import { FlexSpaceBetween, TextOrdinary } from '@theme/parents'
import { icon } from '@theme/icons'
import { theme } from '@theme/theme'
import { colorsFixed } from '@theme/colors'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    width: '100%',
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    height: appScreen.header,
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderStyle: 'solid',
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
  },
})

interface ToastType {
  message: string
  onPress: () => void
  variant: 'error' | 'info'
  pressAfterTime?: number
  iconName?: string
}

export default React.memo(function Toast({
  message,
  variant = 'error',
  onPress,
  pressAfterTime,
  iconName = '',
}: ToastType) {
  const { colors } = useAppTheme()

  useEffect(() => {
    if (pressAfterTime) {
      setTimeout(onPress, pressAfterTime)
    }
  }, [pressAfterTime])

  const _icon = iconName ? iconName : variant === 'error' ? icon.serverRemove : icon.alertCircleOutline

  return (
    <FlexSpaceBetween
      style={[
        styles.container,
        variant === 'error' && {
          backgroundColor: colors.error,
        },
        variant === 'info' && {
          backgroundColor: colors.info,
        },
        {
          borderColor: colorsFixed.black,
        },
        theme.view.shadow,
      ]}
    >
      <Icon name={_icon} color={colorsFixed.white} size={36} />
      <TextOrdinary
        ellipsizeMode='tail'
        numberOfLines={1}
        style={{ width: appScreen.vw - 100 }}
        color={colorsFixed.white}
      >
        {message}
      </TextOrdinary>
      <IconButton iconName={icon.close} size={36} color={colorsFixed.white} onPress={onPress} />
    </FlexSpaceBetween>
  )
})
