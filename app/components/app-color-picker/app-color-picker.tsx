import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AppModal } from '@common'
import { COLORS_EXERCISE } from '@theme/colors'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './styles'

interface IAppColorPicker {
  value: number
  onChange: (value: number) => void
}

export default memo(function AppColorPicker({ value, onChange }: IAppColorPicker) {
  const { colors, isDark } = useAppTheme()
  const [isModal, setIsModal] = useState(false)
  const [colorIdx, setColorIdx] = useState<number>()
  const color = COLORS_EXERCISE[colorIdx === undefined ? value : colorIdx][+isDark]

  const onSubmit = useCallback(() => {
    if (colorIdx !== undefined) onChange(colorIdx)
  }, [colorIdx, onChange])

  const onClose = useCallback(() => {
    setColorIdx(undefined)
    setIsModal(false)
  }, [colorIdx, value])

  return (
    <>
      <TouchableOpacity
        style={{ borderRadius: 100, backgroundColor: color, height: 30, width: 30 }}
        onPress={() => setIsModal(true)}
      />
      <AppModal
        onConfirm={onSubmit}
        onClose={onClose}
        isOpen={isModal}
        header='Chose Color'
        headerStyle={{ color }}
        style={{ borderWidth: 10, borderColor: color }}
      >
        <View style={styles.colorsContainer}>
          {COLORS_EXERCISE.map((colors, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.colorSelect, { backgroundColor: colors[+isDark] }]}
              onPress={() => setColorIdx(idx)}
            />
          ))}
        </View>
      </AppModal>
    </>
  )
})
