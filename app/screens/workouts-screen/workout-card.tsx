import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { Icon } from '@common/icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { Labels, WorkoutDuration } from '@common'
import Stack from '@common/stack/stack'
import AppText from '@common/app-text/app-text'
import { WorkoutType } from '@utils/types'
import { icon } from '@theme/icons'
import { getExerciseColor } from '@theme/tokens'
import { SELECTED_ICON } from './workout-card.constants'
import styles from './workout-card.styles'

type WorkoutCardProps = {
  workout: WorkoutType
  isSelected?: boolean
}

export default memo(function WorkoutCard({ workout, isSelected = false }: WorkoutCardProps) {
  const { colors, isDark } = useAppTheme()
  const color = getExerciseColor(workout?.colorIdx === undefined ? 3 : workout?.colorIdx, isDark)

  return (
    <>
      {isSelected && (
        <Icon name={icon.checkCircle} color={colors.primary} size={SELECTED_ICON.SIZE} style={styles.selectedIcon} />
      )}
      <Stack preset='spaceBetween'>
        <View>
          <AppText variant='title' color={color}>
            {workout.name}
          </AppText>
          <Stack preset='start'>
            <AppText variant='caption' tone='secondary'>
              {workout?.exercises?.length || 0} Exercises
            </AppText>
            <WorkoutDuration exercises={workout.exercises} />
          </Stack>
          <Labels labels={workout.labels} />
        </View>
      </Stack>
    </>
  )
})
