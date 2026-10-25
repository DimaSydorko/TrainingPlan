import * as React from 'react'
import { useEffect } from 'react'
import { Icon } from '../icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { IconButton } from '../index'
import { useScreen } from '@platform/screen'
import AppText from '../app-text/app-text'
import Stack from '../stack/stack'
import { icon } from '@theme/icons'
import { MESSAGE_GUTTER } from './toast.constants'
import styles from './toast.styles'

type ToastType = {
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
  const { width } = useScreen()

  useEffect(() => {
    if (pressAfterTime) {
      setTimeout(onPress, pressAfterTime)
    }
  }, [pressAfterTime])

  const messageStyle = { width: width - MESSAGE_GUTTER }
  const _icon = iconName ? iconName : variant === 'error' ? icon.serverRemove : icon.alertCircleOutline

  return (
    <Stack
      preset='spaceBetween'
      style={[
        styles.container,
        variant === 'error' && {
          backgroundColor: colors.danger,
        },
        variant === 'info' && {
          backgroundColor: colors.info,
        },
        {
          borderColor: colors.staticBlack,
        },
      ]}
    >
      <Icon name={_icon} color={colors.staticWhite} size={36} />
      <AppText ellipsizeMode='tail' numberOfLines={1} style={messageStyle} color={colors.staticWhite}>
        {message}
      </AppText>
      <IconButton iconName={icon.close} size={36} color={colors.staticWhite} onPress={onPress} />
    </Stack>
  )
})
