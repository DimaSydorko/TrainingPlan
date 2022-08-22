import * as React from 'react'
import { memo } from 'react'
import { ScrollView } from 'react-native'

import { useSettings } from '../../Hooks/redux'
import { AppModal } from '../../Common'
import { PlanType, WorkoutType } from '../../Utils/types'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'
import WorkoutCard from '../../Screens/WorkoutsScreen/WorkoutCard'
import { Card } from '../../Theme/Parents'
import Exercise from '../Exercise/Exercise'
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

  return (
    <AppModal
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
      </ScrollView>
    </AppModal>
  )
})
