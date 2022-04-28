import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  NestableScrollContainer,
  NestableDraggableFlatList,
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist'
import { useAppDispatch, useUser, useWorkout } from '../../Hooks/redux'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import {
  Card,
  FlexCenterColumn,
  FlexSpaceBetween,
  FlexStart,
  Page,
  TextHeader,
  TextSecondary,
} from '../../Theme/Parents'
import { AddMoreButton, ConfirmButton, MySwitch, MyTextInput, WorkoutDuration } from '../../Common'
import ExerciseEdit from '../../Components/ExerciseEdit/ExerciseEdit'
import ExerciseResult from '../../Components/ExerciseResults/ExerciseResult'
import { nanoid } from '../../Utils'
import { ApproachType, ExerciseType } from '../../Utils/types'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'
import { TouchableOpacity } from 'react-native'

export const newApproach: ApproachType = {
  repeats: 0,
  weight: 0,
}

export default function WorkoutScreen() {
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const { user } = useUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const [workoutNameInput, setWorkoutNameInput] = useState<string>(selectedWorkout?.name || '')
  const [workoutLabels, setWorkoutLabels] = useState<string[]>(selectedWorkout?.labels || [])
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseType[] | null>(null)

  useEffect(() => {
    setWorkoutExercises(selectedWorkout?.exercises || null)
  }, [selectedWorkout?.exercises])

  const onSaveWorkout = async () => {
    if (!workoutExercises || !user || !selectedWorkout) return
    dispatch(
      workoutActionCreators.updateWorkout({
        ...selectedWorkout,
        name: workoutNameInput,
        labels: workoutLabels,
        exercises: workoutExercises,
      }),
    )
    setIsEditMode(false)
  }

  const onAddExercise = () => {
    const newExercise: ExerciseType = {
      uid: nanoid(),
      name: 'New exercise',
      laps: 0,
      repeats: 1,
      approaches: [newApproach],
      isVisible: true,
      breakTimeInSec: 30,
      imgURL: '',
    }
    setWorkoutExercises(prev => [...(prev || []), newExercise])
  }

  const onChangeExercise = useCallback((exercise: ExerciseType) => {
    setWorkoutExercises(
      prev =>
        prev?.map(ex => {
          if (ex.uid === exercise.uid) return exercise
          else return ex
        }) || null,
    )
  }, [])

  const onDeleteExercise = useCallback(
    (exercise: ExerciseType) => {
      setWorkoutExercises(prev => prev?.filter(ex => ex.uid !== exercise.uid) || null)
    },
    [setWorkoutExercises],
  )

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ExerciseType>) => {
    return (
      <ScaleDecorator>
        <Card>
          <TouchableOpacity onLongPress={drag} disabled={isActive}>
            <ExerciseEdit exercise={item} onSave={onChangeExercise} onDelete={() => onDeleteExercise(item)} />
          </TouchableOpacity>
        </Card>
      </ScaleDecorator>
    )
  }

  return selectedWorkout ? (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <WorkoutDuration exercises={selectedWorkout?.exercises} />
        <FlexStart>
          <TextSecondary style={{ width: 80 }}>Edit Mode:</TextSecondary>
          <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)} />
        </FlexStart>
      </FlexSpaceBetween>
      <FlexCenterColumn style={{ paddingHorizontal: 8 }}>
        {isEditMode && (
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
          </>
        )}
        <NestableScrollContainer>
          {isEditMode ? (
            <NestableDraggableFlatList
              data={workoutExercises}
              renderItem={renderItem}
              keyExtractor={item => item.uid}
              onDragEnd={({ data }) => setWorkoutExercises(data)}
            />
          ) : (
            workoutExercises?.map(exercise => (
              <Card key={exercise.uid}>
                <FlexSpaceBetween>
                  <TextHeader color={colors.secondPrimary}>{exercise.name}</TextHeader>
                  <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>
                </FlexSpaceBetween>
                {exercise.approaches.map((approach, idx) => (
                  <ExerciseResult key={idx} isPrevious weight={approach.weight} repeats={approach.repeats} />
                ))}
              </Card>
            ))
          )}
          {isEditMode && <AddMoreButton onPress={onAddExercise} header={'Exercise'} />}
          {isEditMode && <ConfirmButton onPress={onSaveWorkout} header={'Save workout'} />}
        </NestableScrollContainer>
      </FlexCenterColumn>
    </Page>
  ) : (
    <Page>
      <TextSecondary>Error try reload page</TextSecondary>
    </Page>
  )
}
