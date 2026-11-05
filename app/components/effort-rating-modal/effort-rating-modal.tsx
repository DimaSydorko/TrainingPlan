import { memo, useCallback, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { AppModal } from '@common'
import AppText from '@common/app-text/app-text'
import { useAppTheme } from '@theme/use-app-theme'
import { EFFORT_RATINGS } from './effort-rating-modal.constants'
import styles from './effort-rating-modal.styles'

type EffortRatingModalProps = {
  isOpen: boolean
  onSave: (effortRating?: number) => void
  onClose: () => void
}

const EffortRatingModal = ({ isOpen, onSave, onClose }: EffortRatingModalProps) => {
  const { colors } = useAppTheme()
  const [rating, setRating] = useState<number>()

  const handleSelect = useCallback((value: number) => setRating(prev => (prev === value ? undefined : value)), [])
  const handleConfirm = useCallback(() => onSave(rating), [onSave, rating])

  return (
    <AppModal
      isOpen={isOpen}
      header='How hard was it?'
      text='Optional — helps plan your next workouts.'
      confirmText='Save'
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <View style={styles.options}>
        {EFFORT_RATINGS.map(({ value, label }) => {
          const isSelected = rating === value
          return (
            <TouchableOpacity
              key={value}
              testID={`effortRating.option${value}`}
              onPress={() => handleSelect(value)}
              style={[
                styles.option,
                { borderColor: colors.primary, backgroundColor: isSelected ? colors.primary : colors.background },
              ]}
            >
              <AppText variant='title' color={isSelected ? colors.onPrimary : colors.primary}>
                {value}
              </AppText>
              <AppText variant='caption' color={isSelected ? colors.onPrimary : colors.textSecondary} align='center'>
                {label}
              </AppText>
            </TouchableOpacity>
          )
        })}
      </View>
    </AppModal>
  )
}

export default memo(EffortRatingModal)
