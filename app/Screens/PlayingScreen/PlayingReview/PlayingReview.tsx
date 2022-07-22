import * as React from 'react'
import { memo } from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'

import { useSettings } from '../../../Hooks/redux'
import { SelectedWorkoutType } from '../../../Utils/types'
import Exercise from '../../../Components/Exercise/Exercise'
import { ConfirmButton } from '../../../Common'
import { Card } from '../../../Theme/Parents'
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
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
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
    </SafeAreaView>
  )
})
