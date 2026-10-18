import * as React from 'react'
import { memo, useEffect, useRef } from 'react'
import { ScrollView, View } from 'react-native'

import { useSettings } from '../../../hooks/redux'
import { SelectedWorkoutType } from '../../../utils/types'
import Exercise from '../../../components/exercise/exercise'
import { ConfirmButton } from '../../../common'
import { COLORS_EXERCISE, colorsDark } from '../../../theme/colors'
import { Card } from '../../../theme/parents'
import { useAppInsets } from '../../../theme/insets'
import styles from './styles'

interface IProps {
  playingWorkout: SelectedWorkoutType
  playingExerciseIdx: number
  playingExerciseLap: number
  isTheLastOneComplete: boolean
  onSaveResult: () => void
}

export default memo(function PlayingReview({
  playingWorkout,
  playingExerciseIdx,
  playingExerciseLap,
  isTheLastOneComplete,
  onSaveResult,
}: IProps) {
  const { colors } = useSettings()
  // Sits between the playing header and footer, both of which grow by the system bar insets
  const { top, bottom } = useAppInsets()
  const scrollRef = useRef<ScrollView>(null)
  const isDarkTheme = colors.primary === colorsDark.primary

  useEffect(() => {
    if (isTheLastOneComplete) {
      scrollRef.current.scrollToEnd({ animated: false })
    }
  }, [isTheLastOneComplete])

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          top: styles.container.top + top,
          paddingBottom: styles.container.paddingBottom + top + bottom,
        },
      ]}
    >
      <ScrollView ref={scrollRef}>
        {playingWorkout.exercises.map((exercise, idx) => (
          <View key={exercise.uid}>
            <Card
              style={[
                {
                  borderColor: playingExerciseIdx === idx && !isTheLastOneComplete ? colors.primary : colors.menu,
                  borderWidth: 2,
                  opacity: playingExerciseIdx <= idx && !isTheLastOneComplete ? 1 : 0.8,
                },
              ]}
            >
              <Exercise
                color={COLORS_EXERCISE[exercise?.colorIdx || 0][+isDarkTheme]}
                key={exercise.uid}
                exercise={exercise}
                playingExerciseLap={
                  playingExerciseIdx === idx && !isTheLastOneComplete ? playingExerciseLap : undefined
                }
              />
            </Card>
          </View>
        ))}
        {isTheLastOneComplete && (
          <ConfirmButton header={'Save Result'} style={styles.confirmButton} onPress={onSaveResult} />
        )}
      </ScrollView>
    </View>
  )
})
