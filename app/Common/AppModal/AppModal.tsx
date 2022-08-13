import * as React from 'react'
import { ReactNode } from 'react'
import { Modal, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { ConfirmButton } from '../index'
import { useSettings } from '../../Hooks/redux'
import { FlexCenter, FlexEnd, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
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
  const { colors } = useSettings()
  const buttonStyle: ViewStyle = !onRefuse ? { width: '40%' } : { marginHorizontal: 6, width: '30%' }
  return (
    <Modal animationType='fade' transparent={true} visible={isOpen} onTouchStart={onClose} onRequestClose={onClose}>
      <FlexCenter style={styles.modal}>
        <View style={[styles.container, { backgroundColor: colors.background }, style]}>
          <FlexCenter>
            {!!extraPlaceLeft && <FlexStart style={styles.extraPlaceLeft}>{extraPlaceLeft}</FlexStart>}
            <TextHeader style={headerStyle}>{header}</TextHeader>
            {!!extraPlaceRight && <FlexEnd style={styles.extraPlaceRight}>{extraPlaceRight}</FlexEnd>}
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
        <TouchableOpacity onPress={onClose} style={[styles.emptySpace, { backgroundColor: `${colors.black}40` }]} />
      </FlexCenter>
    </Modal>
  )
}
