import * as React from 'react'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Icon } from '../icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { IconButton } from '../index'
import { useScreen } from '@platform/screen'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { FlexSpaceBetween, TextOrdinary } from '@theme/parents'
import { icon } from '@theme/icons'
import { theme } from '@theme/theme'
import { MESSAGE_GUTTER } from './toast.constants'
import { spacing } from '@theme/tokens'

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
    <FlexSpaceBetween
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
        theme.view.shadow,
      ]}
    >
      <Icon name={_icon} color={colors.staticWhite} size={36} />
      <TextOrdinary
        ellipsizeMode='tail'
        numberOfLines={1}
        style={{ width: width - MESSAGE_GUTTER }}
        color={colors.staticWhite}
      >
        {message}
      </TextOrdinary>
      <IconButton iconName={icon.close} size={36} color={colors.staticWhite} onPress={onPress} />
    </FlexSpaceBetween>
  )
})
