import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'

import AppText from '@common/app-text/app-text'
import Card from '@common/card/card'
import Divider from '@common/divider/divider'
import Stack from '@common/stack/stack'
import { getWorkoutDuration } from '@utils'
import { WorkoutType } from '@utils/types'
import { SECONDS_IN_MINUTE } from '../home-screen.constants'
import styles from './workouts-preview.styles'

type WorkoutsPreviewProps = {
  workouts: WorkoutType[]
  onWorkoutPress: (workout: WorkoutType) => void
  onAllPress: () => void
}

export default memo(function WorkoutsPreview({ workouts, onWorkoutPress, onAllPress }: WorkoutsPreviewProps) {
  const { t, i18n } = useTranslation('home')

  if (!workouts.length) return null

  return (
    <Card style={styles.card} testID='home.workouts'>
      <Stack preset='spaceBetween' style={styles.header}>
        <AppText variant='bodyStrong'>{t('home:workouts.title')}</AppText>
        <TouchableOpacity testID='home.all-workouts' onPress={onAllPress}>
          <AppText variant='caption' tone='accent'>
            {t('home:workouts.all')}
          </AppText>
        </TouchableOpacity>
      </Stack>
      {workouts.map((workout, index) => (
        <React.Fragment key={workout.uid}>
          {index > 0 && <Divider />}
          <TouchableOpacity testID={`home.workout-${index}`} style={styles.row} onPress={() => onWorkoutPress(workout)}>
            <Stack preset='spaceBetween'>
              <AppText variant='body'>{workout.name}</AppText>
              <AppText variant='caption' tone='secondary'>
                {i18n.t('home:workouts.minutes', {
                  count: Math.round(getWorkoutDuration(workout.exercises) / SECONDS_IN_MINUTE),
                })}
              </AppText>
            </Stack>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </Card>
  )
})
