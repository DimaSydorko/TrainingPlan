import React, { useState } from 'react'
import { useAppDispatch, useUser, useWorkout } from '../../Hooks/redux'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { Card, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary } from '../../Theme/Parents'
import { AddMoreButton, ConfirmButton, MySwitch, MyTextInput, WorkoutDuration } from '../../Common'
import ExerciseEdit from '../../Components/ExerciseEdit/ExerciseEdit'
import ExerciseResult from '../../Components/ExerciseResults/ExerciseResult'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'
import { ExerciseType } from '../../Utils/types'

export default function WorkoutScreen() {
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const { user } = useUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const [workoutNameInput, setWorkoutNameInput] = useState<string>(selectedWorkout?.name || '')
  const [workoutLabels, setWorkoutLabels] = useState<string[]>(selectedWorkout?.labels || [])
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseType[] | null>(selectedWorkout?.exercises || null)

  const onSaveWorkout = async () => {
    if (!workoutExercises || !user || !selectedWorkout) return
    dispatch(workoutActionCreators.updateWorkout({
      ...selectedWorkout,
      name: workoutNameInput,
      labels: workoutLabels,
      exercises: workoutExercises,
    }))
    setIsEditMode(false)
  }

  return selectedWorkout ? (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <WorkoutDuration exercises={selectedWorkout?.exercises} />
        <FlexStart>
          <TextSecondary style={{ width: 80 }}>
            Edit Mode:
          </TextSecondary>
          <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)} />
        </FlexStart>
      </FlexSpaceBetween>
      {isEditMode ? (
        <>
          <MyTextInput
            placeholder={'Workout Name'}
            onChangeText={workoutName => setWorkoutNameInput(workoutName)}
            value={workoutNameInput}
            type={'underline'}
          />
          <MyTextInput
            placeholder={'Labels:  #...'}
            onChangeText={value => setWorkoutLabels([value])}
            value={workoutLabels[0]}
            type={'secondary'}
          />
          {selectedWorkout.exercises.map(exercise => (
            <ExerciseEdit
              key={`${exercise.name}_${exercise.breakTimeInSec}_${exercise.repeats}`}
              exercise={exercise}
            />
          ))}
          <AddMoreButton onPress={() => {
          }} header={'Exercise'} />
          <ConfirmButton onPress={onSaveWorkout} header={'Save workout'} />
        </>
      ) : selectedWorkout.exercises.map(exercise => (
        <Card key={`${exercise.name}_${exercise.breakTimeInSec}_${exercise.repeats}`}>
          <FlexSpaceBetween>
            <TextHeader color={colors.secondPrimary}>
              {exercise.name}
            </TextHeader>
            <TextSecondary>
              Break: {secondsToMinSec(exercise.breakTimeInSec)}
            </TextSecondary>
          </FlexSpaceBetween>
          {exercise.approaches.map((approach, idx) => (
            <ExerciseResult
              key={idx}
              isPrevious
              weight={approach.weight}
              repeats={approach.repeats}
            />
          ))}
        </Card>
      ))}
    </Page>
  ) : (
    <Page>
      <TextSecondary>
        Error try reload page
      </TextSecondary>
    </Page>
  )
}