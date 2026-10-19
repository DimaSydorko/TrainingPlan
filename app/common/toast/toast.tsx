import * as React from 'react'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Icon } from '../icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { IconButton } from '../index'
import { useScreen } from '@platform/screen'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import AppText from '../app-text/app-text'
import Stack from '../stack/stack'
import { icon } from '@theme/icons'
import { MESSAGE_GUTTER } from './toast.constants'
import { shadow, spacing } from '@theme/tokens'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    width: '100%',
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    height: BAR_HEIGHT.HEADER,
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderStyle: 'solid',
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    ...shadow.card,
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
  const { width } = useScreen()

  useEffect(() => {
    if (pressAfterTime) {
      setTimeout(onPress, pressAfterTime)
    }
  }, [pressAfterTime])

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
      <AppText
        ellipsizeMode='tail'
        numberOfLines={1}
        style={{ width: width - MESSAGE_GUTTER }}
        color={colors.staticWhite}
      >
        {message}
      </AppText>
      <IconButton iconName={icon.close} size={36} color={colors.staticWhite} onPress={onPress} />
    </Stack>
  )
})
