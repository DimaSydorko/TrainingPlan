import * as React from 'react'
import { ReactNode } from 'react'
import { Modal, TouchableOpacity, View, ViewStyle } from 'react-native'
import { ConfirmButton } from '../index'
import { FlexCenter, FlexEnd, TextHeader, TextSecondary } from '../../Theme/Parents'
import { colors } from '../../Theme/colors'
import styles from './styles'

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
  extraPlace?: ReactNode
  children?: ReactNode
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
  extraPlace,
  disabled,
  disableAutoClose = false,
  confirmText = 'Confirm'
}: AppModalType) {
  const buttonStyle: ViewStyle = !onRefuse ? { width: '40%' } : { marginHorizontal: 6, width: '30%' }
  return (
    <Modal animationType='fade' transparent={true} visible={isOpen} onTouchStart={onClose} onRequestClose={onClose}>
      <FlexCenter style={styles.modal}>
        <View style={styles.container}>
          <FlexCenter>
            <TextHeader>{header}</TextHeader>
            {!!extraPlace && <FlexEnd style={styles.extraPlace}>{extraPlace}</FlexEnd>}
          </FlexCenter>
          <FlexCenter style={styles.content}>
            {text && <TextSecondary style={styles.text}>{text}</TextSecondary>}
            {children}
          </FlexCenter>
          <FlexCenter>
            <ConfirmButton header={'Cancel'} color={colors.disabled} style={buttonStyle} onPress={onClose} />
            {!!onRefuse && (
              <ConfirmButton
                header={'No'}
                color={colors.error}
                style={buttonStyle}
                onPress={() => {
                  onRefuse()
                  !disableAutoClose && onClose()
                }}
              />
            )}
            <ConfirmButton
              header={confirmText}
              color={isWarning ? colors.error : colors.primary}
              style={buttonStyle}
              disabled={disabled}
              onPress={() => {
                onConfirm()
                !disableAutoClose && onClose()
              }}
            />
          </FlexCenter>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.emptySpace} />
      </FlexCenter>
    </Modal>
  )
}
