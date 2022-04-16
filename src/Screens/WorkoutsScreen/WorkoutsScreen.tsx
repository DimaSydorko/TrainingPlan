import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { View } from 'react-native'
import { selectWorkout } from '../../store/WorkoutReducer/WorkoutSlice'
import useWorkoutPlan from '../../Hooks/useWorkoutPlan'
import { useAppDispatch, useUser, useWorkout } from '../../Hooks/redux'
import { WorkoutType } from '../../Utils/types'
import { ScreenName } from '../../Utils/constants'
import { AddMoreButton, IconButton, MySwitch, WorkoutDuration } from '../../Common'
import { CardPressed, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'

interface PlanScreenType {
  isInPlan?: boolean;
}

export default function WorkoutsScreen({ isInPlan = false }: PlanScreenType) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const workout = useWorkout()
  const { user } = useUser()
  const { addWorkout, deleteWorkout, addWorkoutInPlane, deleteWorkoutInPlane } = useWorkoutPlan()
  const [isEditMode, setIsEditMode] = useState(false)
  const workouts = isInPlan ? workout.workoutsInPlan : workout.workouts

  const onSelect = (workout: WorkoutType) => {
    dispatch(selectWorkout(workout))
    navigation.navigate(isInPlan ? ScreenName.WorkoutInPlan : ScreenName.Workout)
  }

  const onAddWorkout = () => {
    if (!user) return
    const newWorkout = {
      uid: '',
      plansUid: [],
      name: 'New workout',
      ownerUid: user.uid,
      labels: [],
      exercises: [],
    }
    isInPlan
      ? addWorkoutInPlane(newWorkout)
      : addWorkout(newWorkout)
  }

  const onDeleteWorkout = (workout: WorkoutType) => {
    isInPlan
      ? deleteWorkoutInPlane(workout)
      : deleteWorkout(workout)
  }

  return (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <View />
        {workouts?.length ? (
          <FlexStart>
            <TextSecondary style={{ width: 80 }}>
              Edit Mode:
            </TextSecondary>
            <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)} />
          </FlexStart>
        ) : null}
      </FlexSpaceBetween>
      {workouts?.map(workout => (
        <CardPressed key={workout.uid} onPress={() => onSelect(workout)}>
          <FlexSpaceBetween>
            <View>
              <TextHeader color={colors.secondPrimary}>{workout.name}</TextHeader>
              <FlexStart>
                <TextSecondary>{workout.exercises.length} Exercises</TextSecondary>
                <WorkoutDuration exercises={workout.exercises} />
                {(!!workout.plansUid.length && !isInPlan) && <TextSecondary>(In Plane)</TextSecondary>}
              </FlexStart>
            </View>
            {isEditMode && <IconButton iconName={icon.delete} onPress={() => onDeleteWorkout(workout)} />}
          </FlexSpaceBetween>
        </CardPressed>
      ))}
      {(isEditMode || !workouts?.length) && <AddMoreButton onPress={onAddWorkout} header={'Workout'} />}
    </Page>
  )
}