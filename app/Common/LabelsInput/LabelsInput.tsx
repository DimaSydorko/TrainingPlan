import * as React from 'react'
import { useCallback, useState } from 'react'
import { View, ViewStyle } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { FlexStart, TextSecondary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import { SetStateType } from '../../Utils/types'
import { IconButton, MyTextInput } from '../index'
import styles from './styles'

interface IProps {
  labels: string[]
  setLabels: SetStateType<string[]>
  onWriteLabel?: (labels?: string[]) => void
  style?: ViewStyle
}

const MAX_LABELS_COUNT = 6
const MAX_LABEL_LENGTH = 16

export default function LabelsInput({ setLabels, style, labels, onWriteLabel }: IProps) {
  const { colors } = useSettings()
  const [editLabelIdx, setEditLabelIdx] = useState<number>(labels.length - 1)

  const onNextLabel = useCallback(() => {
    if (!!labels[editLabelIdx] && MAX_LABELS_COUNT > editLabelIdx + 1) {
      onWriteLabel && onWriteLabel()
      setEditLabelIdx(p => p + 1)
    }
  }, [labels[editLabelIdx]])

  const onPrevLabel = useCallback(() => {
    setEditLabelIdx(p => {
      if (p === 1 && onWriteLabel) onWriteLabel([])
      if (p <= 0) return 0
      else {
        onWriteLabel && onWriteLabel()
        return p - 1
      }
    })
  }, [onWriteLabel, setEditLabelIdx])

  const onChangeText = useCallback(
    (v: string) => {
      if (v.slice(-1) === ' ') onNextLabel()
      const newValue = v.replace(' ', '')

      if (!newValue) onPrevLabel()
      if (MAX_LABEL_LENGTH >= newValue.length) {
        setLabels(p => {
          p[editLabelIdx] = newValue
          return [...p]
        })
      }
    },
    [editLabelIdx, onNextLabel, onPrevLabel]
  )
  const onDeleteLabel = useCallback(
    (id: number) => {
      setLabels(p => p.filter((_, idx) => idx !== id))
      onPrevLabel()
    },
    [setLabels, onPrevLabel]
  )

  return (
    <View style={[styles.container, style]}>
      <FlexStart style={styles.labels}>
        {labels.map((label, idx) =>
          label ? (
            <FlexStart style={[styles.labelText, { backgroundColor: `${colors.secondPrimary}40` }]}>
              <TextSecondary style={{ color: colors.secondPrimary }}>{label}</TextSecondary>
              <IconButton
                iconName={icon.close}
                margin={2}
                style={{ marginTop: 2 }}
                onPress={() => onDeleteLabel(idx)}
                color={colors.secondPrimary}
                size={18}
              />
            </FlexStart>
          ) : null
        )}
      </FlexStart>
      <MyTextInput
        type='secondary'
        autoCapitalize='none'
        placeholder={'Search Labels'}
        onChangeText={onChangeText}
        value={labels[editLabelIdx]}
        onBlur={onNextLabel}
      />
    </View>
  )
}
