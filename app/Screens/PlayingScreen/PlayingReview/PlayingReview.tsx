import * as React from 'react'
import { memo } from 'react'
import { SafeAreaView } from 'react-native'

import { useSettings } from '../../../Hooks/redux'
import { SelectedWorkoutType } from '../../../Utils/types'
import Exercise from '../../../Components/Exercise/Exercise'
import { Card } from '../../../Theme/Parents'
import styles from './styles'

interface IProps {
  playingWorkout: SelectedWorkoutType
  playingExerciseIdx: number
}

export default memo(function PlayingReview({ playingWorkout, playingExerciseIdx }: IProps) {
  const { colors } = useSettings()
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {playingWorkout.exercises.map((exercise, idx) => (
        <Card
          key={exercise.uid}
          style={[{ borderColor: playingExerciseIdx >= idx ? colors.primary : colors.menu, borderWidth: 2 }]}
        >
          <Exercise key={exercise.uid} exercise={exercise} />
        </Card>
      ))}
    </SafeAreaView>
  )
})
