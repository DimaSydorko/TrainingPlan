import * as React from 'react'
import { memo, useState } from 'react'
import { View } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { AppModal, IconButton, WorkoutDuration } from '../../Common'
import { FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
import { WorkoutType } from '../../Utils/types'
import { icon } from '../../Theme/icons'

interface IWorkoutCard {
  workout: WorkoutType
  isEditMode: boolean
  isInPlan: boolean
  onDelete: () => void
}

export default memo(function WorkoutCard({ workout, isInPlan, isEditMode, onDelete }: IWorkoutCard) {
  const { colors } = useSettings()
  const [isDeleteModal, setIsDeleteModal] = useState(false)

  return (
    <>
      <FlexSpaceBetween>
        <View>
          <TextHeader color={colors.secondPrimary}>{workout.name}</TextHeader>
          <FlexStart>
            <TextSecondary>{workout.exercises.length} Exercises</TextSecondary>
            <WorkoutDuration exercises={workout.exercises} />
            {!!workout.plansUid.length && !isInPlan && <TextSecondary>(In Plan)</TextSecondary>}
          </FlexStart>
        </View>
        {isEditMode && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
      </FlexSpaceBetween>
      <AppModal
        isWarning
        header='Delete workout'
        text={`Are you sure you want to delete '${workout.name}' workout ${
          isInPlan
            ? 'from this plan'
            : `forever?${
                !!workout.plansUid.length
                  ? ` It's exist in ${workout.plansUid.length} plan${workout.plansUid.length > 1 ? 's' : ''}.`
                  : ''
              }`
        }`}
        confirmText='Yes, delete'
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
        onConfirm={() => onDelete()}
      />
    </>
  )
})
