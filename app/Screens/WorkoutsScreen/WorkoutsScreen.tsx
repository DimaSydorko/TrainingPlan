import * as React from 'react'
import {memo, useCallback, useState} from 'react'
import { useNavigation } from '@react-navigation/native'
import { View } from 'react-native'
import { selectWorkout } from '../../store/WorkoutReducer/WorkoutSlice'
import useWorkoutPlan from '../../Hooks/useWorkoutPlan'
import { useAppDispatch, useUser, useWorkout } from '../../Hooks/redux'
import { WorkoutType } from '../../Utils/types'
import { ScreenName } from '../../Utils/constants'
import { AddMoreButton, MySwitch } from '../../Common'
import WorkoutCard from './WorkoutCard'
import { FlexSpaceBetween, FlexStart, Page, TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'

interface IPlanScreen {
  isInPlan?: boolean;
}

export default memo(function WorkoutsScreen({ isInPlan = false }: IPlanScreen) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const workout = useWorkout()
  const { user } = useUser()
  const { addWorkout, deleteWorkout, addWorkoutInPlane, deleteWorkoutInPlane } = useWorkoutPlan()
  const [isEditMode, setIsEditMode] = useState(false)
  const workouts = isInPlan ? workout.workoutsInPlan : workout.workouts

  const onSelect = useCallback((workout: WorkoutType) => {
    dispatch(selectWorkout(workout))
    navigation.navigate(isInPlan ? ScreenName.WorkoutInPlan : ScreenName.Workout)
  }, [isInPlan])

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

  const onDelete = useCallback((workout: WorkoutType) => {
    isInPlan
      ? deleteWorkoutInPlane(workout)
      : deleteWorkout(workout)
  }, [deleteWorkoutInPlane, deleteWorkout, isInPlan])

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
        <WorkoutCard
          key={workout.uid}
          workout={workout}
          isInPlan={isInPlan}
          isEditMode={isEditMode}
          onSelect={() => onSelect(workout)}
          onDelete={() => onDelete(workout)}
        />
      ))}
      {(isEditMode || !workouts?.length) && <AddMoreButton onPress={onAddWorkout} header={'Workout'} />}
    </Page>
  )
})