import * as React from 'react'
import { ReactNode } from 'react'
import { Modal, TouchableOpacity, View } from 'react-native'
import { ConfirmButton } from '../index'
import { FlexCenter, TextHeader, TextSecondary } from '../../Theme/Parents'
import { colors } from '../../Theme/colors'
import styles from './styles'

interface AppModalType {
  onConfirm: () => void
  onClose: () => void
  isWarning?: boolean
  isOpen: boolean
  header: string
  text?: string
  confirmText?: string
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
   confirmText = 'Confirm',
 }: AppModalType) {
  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={isOpen}
      onTouchStart={onClose}
      onRequestClose={onClose}
    >
      <FlexCenter style={styles.modal}>
        <View style={styles.container}>
          <FlexCenter>
            <TextHeader>{header}</TextHeader>
          </FlexCenter>
          <FlexCenter style={styles.content}>
            {text && <TextSecondary style={styles.text} >{text}</TextSecondary>}
            {children}
          </FlexCenter>
          <FlexCenter>
            <ConfirmButton header={'Cancel'} color={colors.disabled} onPress={onClose} />
            <ConfirmButton
              header={confirmText}
              color={isWarning ? colors.error : colors.primary}
              onPress={() => {
                onConfirm()
                onClose()
              }}
            />
          </FlexCenter>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.emptySpace} />
      </FlexCenter>
    </Modal>
  )
}