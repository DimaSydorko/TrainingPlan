import * as React from 'react'
import { useCallback, useState } from 'react'
import { View, ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import Stack from '../stack/stack'
import { icon } from '@theme/icons'
import { SetStateType } from '@utils/types'
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
  const { colors } = useAppTheme()
  const [editLabelIdx, setEditLabelIdx] = useState<number>(labels?.length || 0)

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
      <Stack preset='start' style={styles.labels}>
        {labels.map((label, idx) =>
          label ? (
            <Stack
              preset='start'
              key={`${idx}-${label}`}
              style={[styles.labelText, { backgroundColor: `${colors.accent}40` }]}
            >
              <AppText variant='caption' tone='accent'>
                {label}
              </AppText>
              <IconButton
                iconName={icon.close}
                margin={2}
                style={{ marginTop: 2 }}
                onPress={() => onDeleteLabel(idx)}
                color={colors.accent}
                size={18}
              />
            </Stack>
          ) : null
        )}
      </Stack>
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
