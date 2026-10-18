import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { Icon } from '@common/icon/icon'
import { useSettings } from '@hooks/redux'
import { Labels, WorkoutDuration } from '@common'
import { FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '@theme/parents'
import { WorkoutType } from '@utils/types'
import { icon } from '@theme/icons'
import { COLORS_EXERCISE, colorsDark } from '@theme/colors'

interface IWorkoutCard {
  workout: WorkoutType
  isSelected?: boolean
}

export default memo(function WorkoutCard({ workout, isSelected = false }: IWorkoutCard) {
  const { colors } = useSettings()
  const isDarkTheme = colors.primary === colorsDark.primary
  const color = COLORS_EXERCISE[workout?.colorIdx === undefined ? 3 : workout?.colorIdx][+isDarkTheme]

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
