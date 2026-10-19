import * as React from 'react'
import { memo, useEffect, useRef } from 'react'
import { ScrollView, View } from 'react-native'

import { useAppTheme } from '@theme/use-app-theme'
import { SelectedWorkoutType } from '@utils/types'
import Exercise from '@components/exercise/exercise'
import { ConfirmButton } from '@common'
import { getExerciseColor } from '@theme/tokens'
import Card from '@common/card/card'
import { useAppInsets } from '@theme/insets'
import { useScreen } from '@platform/screen'
import styles from './styles'
import { PLAYING_GUTTER } from '../playing-screen.constants'

type PropsType = {
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
}: PropsType) {
  const { colors, isDark } = useAppTheme()
  // Sits between the playing header and footer, both of which grow by the system bar insets
  const { top, bottom } = useAppInsets()
  const { width } = useScreen()
  const scrollRef = useRef<ScrollView>(null)

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
                  borderColor:
                    playingExerciseIdx === idx && !isTheLastOneComplete ? colors.primary : colors.surfaceElevated,
                  borderWidth: 2,
                  opacity: playingExerciseIdx <= idx && !isTheLastOneComplete ? 1 : 0.8,
                },
              ]}
            >
              <Exercise
                color={getExerciseColor(exercise?.colorIdx || 0, isDark)}
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
          <ConfirmButton
            header={'Save Result'}
            style={[styles.confirmButton, { width: width - PLAYING_GUTTER.SAVE_BUTTON }]}
            onPress={onSaveResult}
          />
        )}
      </ScrollView>
    </View>
  )
})
