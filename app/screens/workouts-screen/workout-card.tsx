import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { Icon } from '@common/icon/icon'
import { useAppTheme } from '@theme/use-app-theme'
import { Labels, WorkoutDuration } from '@common'
import { FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '@theme/parents'
import { WorkoutType } from '@utils/types'
import { icon } from '@theme/icons'
import { getExerciseColor } from '@theme/tokens'

interface IWorkoutCard {
  workout: WorkoutType
  isSelected?: boolean
}

export default memo(function WorkoutCard({ workout, isSelected = false }: IWorkoutCard) {
  const { colors, isDark } = useAppTheme()
  const color = getExerciseColor(workout?.colorIdx === undefined ? 3 : workout?.colorIdx, isDark)

  return (
    <>
      {isSelected && (
        <Icon
          name={icon.checkCircle}
          color={colors.primary}
          size={16}
          style={{ position: 'absolute', left: -12, top: -12 }}
        />
      )}
      <FlexSpaceBetween>
        <View>
          <TextHeader color={color}>{workout.name}</TextHeader>
          <FlexStart>
            <TextSecondary>{workout?.exercises?.length || 0} Exercises</TextSecondary>
            <WorkoutDuration exercises={workout.exercises} />
          </FlexStart>
          <Labels labels={workout.labels} />
        </View>
      </FlexSpaceBetween>
    </>
  )
})
