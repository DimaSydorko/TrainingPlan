import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AppModal } from '@common'
import { EXERCISE_COLOR_NAMES, getExerciseColor } from '@theme/tokens'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './styles'

type AppColorPickerProps = {
  value: number
  onChange: (value: number) => void
}

export default memo(function AppColorPicker({ value, onChange }: AppColorPickerProps) {
  const { isDark } = useAppTheme()
  const [isModal, setIsModal] = useState(false)
  const [colorIdx, setColorIdx] = useState<number>()
  const color = getExerciseColor(colorIdx === undefined ? value : colorIdx, isDark)

  const headerStyle = { color }

  const onSubmit = useCallback(() => {
    if (colorIdx !== undefined) onChange(colorIdx)
  }, [colorIdx, onChange])

  const onClose = useCallback(() => {
    setColorIdx(undefined)
    setIsModal(false)
  }, [])

  return (
    <>
      <TouchableOpacity style={[styles.preview, { backgroundColor: color }]} onPress={() => setIsModal(true)} />
      <AppModal
        onConfirm={onSubmit}
        onClose={onClose}
        isOpen={isModal}
        header='Chose Color'
        headerStyle={headerStyle}
        style={[styles.modal, { borderColor: color }]}
      >
        <View style={styles.colorsContainer}>
          {EXERCISE_COLOR_NAMES.map((colorName, idx) => (
            <TouchableOpacity
              key={colorName}
              style={[styles.colorSelect, { backgroundColor: getExerciseColor(idx, isDark) }]}
              onPress={() => setColorIdx(idx)}
            />
          ))}
        </View>
      </AppModal>
    </>
  )
})
