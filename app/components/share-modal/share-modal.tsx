import * as React from 'react'
import { memo } from 'react'
import { ScrollView } from 'react-native'

import { useAppTheme } from '@theme/use-app-theme'
import { AppModal } from '@common'
import { PlanType, WorkoutType } from '@utils/types'
import { getExerciseColor } from '@theme/tokens'
import WorkoutCard from '@screens/workouts-screen/workout-card'
import AppText from '@common/app-text/app-text'
import Card from '@common/card/card'
import Exercise from '../exercise/exercise'
import { useScreen } from '@platform/screen'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import styles from './styles'
import { RESERVED_HEADER_COUNT } from './share-modal.constants'

interface PropsType {
  isOpen: boolean
  onClose: () => void
  onShare: () => void
  plan?: PlanType
  workout?: WorkoutType
}

export default memo(function ShareModal({ onClose, isOpen, onShare, workout, plan }: PropsType) {
  const { isDark } = useAppTheme()
  const isPlan = !!plan && !workout
  const isEmpty = isPlan ? !plan?.workouts?.length : !workout?.exercises?.length
  const { height } = useScreen()

  return (
    <AppModal
      disabled={isEmpty}
      onConfirm={onShare}
      confirmText='Share'
      onClose={onClose}
      isOpen={isOpen}
      header={`Confirm share ${isPlan ? 'plan' : 'workout'}`}
    >
      <ScrollView style={[styles.container, { maxHeight: height - BAR_HEIGHT.HEADER * RESERVED_HEADER_COUNT }]}>
        {isPlan
          ? plan?.workouts?.map(workout => (
              <Card key={workout.uid} style={styles.card}>
                <WorkoutCard workout={workout} />
              </Card>
            ))
          : workout?.exercises?.map(ex => {
              const color = getExerciseColor(ex?.colorIdx || 0, isDark)
              return (
                <Card key={ex.uid} style={styles.card}>
                  <Exercise isPublic isInModal exercise={ex} color={color} />
                </Card>
              )
            })}
        {isEmpty && (
          <AppText tone='accent' align='center'>
            You can&apos;t share empty {isPlan ? 'Plan' : 'Workout'}!
          </AppText>
        )}
      </ScrollView>
    </AppModal>
  )
})
