import * as React from 'react'
import { memo } from 'react'
import { ScrollView } from 'react-native'

import { useSettings, useWorkout } from '../../Hooks/redux'
import { AppModal } from '../../Common'
import { PlanType, WorkoutType } from '../../Utils/types'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'
import { Card } from '../../Theme/Parents'
import Exercise from '../Exercise/Exercise'
import styles from './styles'
import WorkoutCard from '../../Screens/WorkoutsScreen/WorkoutCard'

interface PropsType {
  isOpen: boolean
  onClose: () => void
  onShare: () => void
  plan?: PlanType
  workout?: WorkoutType
}

export default memo(function ShareModal({ onClose, isOpen, onShare, workout, plan }: PropsType) {
  const { colors } = useSettings()
  const { workouts } = useWorkout()
  const isDarkTheme = colors.primary === colorsDark.primary
  const isPlan = !!plan && !workout

  return (
    <AppModal
      onConfirm={onShare}
      confirmText='Share'
      onClose={onClose}
      isOpen={isOpen}
      header={`Share ${isPlan ? 'plan' : 'workout'}`}
    >
      <ScrollView style={styles.container}>
        {isPlan
          ? plan?.workoutUids?.map(uid => {
              const workout: WorkoutType = workouts.find(w => w.uid === uid)
              return (
                <Card key={uid} style={styles.card}>
                  <WorkoutCard workout={workout} isInPlan />
                </Card>
              )
            })
          : workout?.exercises?.map(ex => {
              const color = COLORS_EXERCISE[ex?.colorIdx || 0][+isDarkTheme]
              return (
                <Card key={ex.uid} style={styles.card}>
                  <Exercise exercise={ex} color={color} isPublic />
                </Card>
              )
            })}
      </ScrollView>
    </AppModal>
  )
})
