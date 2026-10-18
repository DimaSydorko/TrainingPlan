import * as React from 'react'
import { memo } from 'react'
import { ScrollView } from 'react-native'

import { useSettings } from '@hooks/redux'
import { AppModal } from '@common'
import { PlanType, WorkoutType } from '@utils/types'
import { COLORS_EXERCISE, colorsDark } from '@theme/colors'
import WorkoutCard from '@screens/workouts-screen/workout-card'
import { Card, TextOrdinary } from '@theme/parents'
import Exercise from '../exercise/exercise'
import styles from './styles'

interface PropsType {
  isOpen: boolean
  onClose: () => void
  onShare: () => void
  plan?: PlanType
  workout?: WorkoutType
}

export default memo(function ShareModal({ onClose, isOpen, onShare, workout, plan }: PropsType) {
  const { colors } = useSettings()
  const isDarkTheme = colors.primary === colorsDark.primary
  const isPlan = !!plan && !workout
  const isEmpty = isPlan ? !plan?.workouts?.length : !workout?.exercises?.length
  return (
    <AppModal
      disabled={isEmpty}
      onConfirm={onShare}
      confirmText='Share'
      onClose={onClose}
      isOpen={isOpen}
      header={`Confirm share ${isPlan ? 'plan' : 'workout'}`}
    >
      <ScrollView style={styles.container}>
        {isPlan
          ? plan?.workouts?.map(workout => (
              <Card key={workout.uid} style={styles.card}>
                <WorkoutCard workout={workout} />
              </Card>
            ))
          : workout?.exercises?.map(ex => {
              const color = COLORS_EXERCISE[ex?.colorIdx || 0][+isDarkTheme]
              return (
                <Card key={ex.uid} style={styles.card}>
                  <Exercise isPublic isInModal exercise={ex} color={color} />
                </Card>
              )
            })}
        {isEmpty && (
          <TextOrdinary center color={colors.secondPrimary}>
            You can&apos;t share empty {isPlan ? 'Plan' : 'Workout'}!
          </TextOrdinary>
        )}
      </ScrollView>
    </AppModal>
  )
})
