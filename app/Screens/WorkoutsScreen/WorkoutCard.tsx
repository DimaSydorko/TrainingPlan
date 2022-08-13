import * as React from 'react'
import { memo, useState } from 'react'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSettings } from '../../Hooks/redux'
import { AppModal, Labels, WorkoutDuration } from '../../Common'
import { FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
import { WorkoutType } from '../../Utils/types'
import { icon } from '../../Theme/icons'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'

interface IWorkoutCard {
  workout: WorkoutType
  isSelected?: boolean
}

export default memo(function WorkoutCard({ workout, isSelected = false }: IWorkoutCard) {
  const { colors } = useSettings()
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const isDarkTheme = colors.primary === colorsDark.primary
  const color = COLORS_EXERCISE[workout?.colorIdx || 3][+isDarkTheme]

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
      <AppModal
        isWarning
        header='Delete workout'
        text={`Are you sure you want to delete '${workout.name}' workout ?`}
        confirmText='Yes, delete'
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
        onConfirm={() => {}}
      />
    </>
  )
})
