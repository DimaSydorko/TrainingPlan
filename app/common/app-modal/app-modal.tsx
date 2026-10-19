import * as React from 'react'
import { ReactNode } from 'react'
import { Modal, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { ConfirmButton } from '../index'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import Stack from '../stack/stack'
import { useScreen } from '@platform/screen'
import styles from './styles'
import { MODAL_GUTTER } from './app-modal.constants'

interface AppModalType {
  onConfirm: () => void
  onClose: () => void
  onRefuse?: () => void
  isWarning?: boolean
  isOpen: boolean
  disableAutoClose?: boolean
  disabled?: boolean
  header: string
  text?: string
  confirmText?: string
  extraPlaceRight?: ReactNode
  extraPlaceLeft?: ReactNode
  children?: ReactNode
  style?: ViewStyle
  headerStyle?: TextStyle
}

export default function AppModal({
  onConfirm,
  onClose,
  header,
  text,
  isOpen,
  isWarning,
  children,
  onRefuse,
  extraPlaceRight,
  extraPlaceLeft,
  disabled,
  disableAutoClose = false,
  confirmText = 'Confirm',
  style,
  headerStyle,
}: AppModalType) {
  const { colors } = useAppTheme()
  const { width } = useScreen()
  const buttonStyle: ViewStyle = !onRefuse ? { width: '40%' } : { marginHorizontal: 6, width: '30%' }
  return (
    <Modal animationType='fade' transparent={true} visible={isOpen} onTouchStart={onClose} onRequestClose={onClose}>
      <Stack preset='center' style={styles.modal}>
        <View
          style={[styles.container, { width: width - MODAL_GUTTER }, { backgroundColor: colors.background }, style]}
        >
          <Stack preset='center'>
            {!!extraPlaceLeft && (
              <Stack preset='start' style={styles.extraPlaceLeft}>
                {extraPlaceLeft}
              </Stack>
            )}
            <AppText variant='title' style={headerStyle}>
              {header}
            </AppText>
            {!!extraPlaceRight && (
              <Stack preset='end' style={styles.extraPlaceRight}>
                {extraPlaceRight}
              </Stack>
            )}
          </Stack>
          <Stack preset='center' style={styles.content}>
            {text && (
              <AppText variant='caption' tone='secondary' style={styles.text}>
                {text}
              </AppText>
            )}
            {children}
          </Stack>
          <Stack preset='center'>
            <ConfirmButton
              header={'Cancel'}
              color={colors.disabled}
              style={buttonStyle}
              onPress={onClose}
              testID='appModal.cancel'
            />
            {!!onRefuse && (
              <ConfirmButton
                header={'No'}
                testID='appModal.refuse'
                color={colors.danger}
                style={buttonStyle}
                onPress={() => {
                  onRefuse()
                  !disableAutoClose && onClose()
                }}
              />
            )}
            <ConfirmButton
              header={confirmText}
              testID='appModal.confirm'
              color={isWarning ? colors.danger : colors.primary}
              style={buttonStyle}
              disabled={disabled}
              onPress={() => {
                onConfirm()
                !disableAutoClose && onClose()
              }}
            />
          </Stack>
        </View>
        <TouchableOpacity onPress={onClose} style={[styles.emptySpace, { backgroundColor: `${colors.inverse}40` }]} />
      </Stack>
    </Modal>
  )
}
