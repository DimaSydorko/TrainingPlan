import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'

import AppText from '@common/app-text/app-text'
import Card from '@common/card/card'
import { Icon } from '@common/icon/icon'
import Stack from '@common/stack/stack'
import { icon } from '@theme/icons'
import { useThemeColors } from '@theme/use-app-theme'
import { getWorkoutDuration } from '@utils'
import { WorkoutType } from '@utils/types'
import { HOME_ICON_SIZE, SECONDS_IN_MINUTE } from '../home-screen.constants'
import styles from './today-session-card.styles'

type TodaySessionCardProps = {
  workout: WorkoutType
  onStart: (workout: WorkoutType) => void
  onChange: () => void
}

export default memo(function TodaySessionCard({ workout, onStart, onChange }: TodaySessionCardProps) {
  const { t, i18n } = useTranslation('home')
  const colors = useThemeColors()
  const minutes = Math.round(getWorkoutDuration(workout.exercises) / SECONDS_IN_MINUTE)
  const exercisesCount = workout.exercises.length

  const handleStart = () => onStart(workout)

  return (
    <Card style={styles.card} testID='home.today-session'>
      <AppText variant='caption' tone='secondary'>
        {t('home:todaySession.label')}
      </AppText>
      <AppText variant='title' style={styles.title}>
        {workout.name}
      </AppText>
      <Stack preset='start' gap='md'>
        <Stack preset='start'>
          <Icon name={icon.timer} size={HOME_ICON_SIZE.SMALL} color={colors.textSecondary} />
          <AppText variant='caption' tone='secondary'>
            {i18n.t('home:todaySession.minutes', { count: minutes })}
          </AppText>
        </Stack>
        <AppText variant='caption' tone='secondary'>
          {i18n.t('home:todaySession.exercises', { count: exercisesCount })}
        </AppText>
      </Stack>
      <TouchableOpacity
        testID='home.start'
        style={[styles.startButton, { backgroundColor: colors.accent }]}
        onPress={handleStart}
      >
        <Stack preset='center' gap='sm'>
          <Icon name={icon.play} size={HOME_ICON_SIZE.MEDIUM} color={colors.onPrimary} />
          <AppText variant='bodyStrong' tone='onPrimary'>
            {t('home:todaySession.start')}
          </AppText>
        </Stack>
      </TouchableOpacity>
      <TouchableOpacity testID='home.change' style={styles.changeButton} onPress={onChange}>
        <AppText variant='caption' tone='secondary' align='center'>
          {t('home:todaySession.change')}
        </AppText>
      </TouchableOpacity>
    </Card>
  )
})
