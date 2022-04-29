import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
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
import {
  AddMoreButton,
  AppModal,
  ConfirmButton,
  GoBackSubmitModal,
  MySwitch,
  MyTextInput,
  WorkoutDuration,
} from '../../Common'
import ExerciseEdit from '../../Components/ExerciseEdit/ExerciseEdit'
import ExerciseResult from '../../Components/ExerciseResults/ExerciseResult'
import { defaultExercise, FUTURE_FLAG } from '../../Utils/constants'
import { deepCompare, nanoid } from '../../Utils'
import { ExerciseType, WorkoutType } from '../../Utils/types'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'

export default function WorkoutScreen() {
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const { user } = useUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [newExerciseId, setNewExerciseId] = useState('')
  const [workoutNameInput, setWorkoutNameInput] = useState<string>(selectedWorkout?.name || '')
  const [workoutLabels, setWorkoutLabels] = useState<string[]>(selectedWorkout?.labels || [])
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseType[] | null>(null)

  const changedWorkout: WorkoutType = useMemo(
    () => ({
      ...selectedWorkout,
      name: workoutNameInput,
      labels: workoutLabels,
      exercises: workoutExercises,
    }),
    [workoutNameInput, workoutLabels, workoutExercises, selectedWorkout],
  )
  const isChanged = useMemo(() => !deepCompare(selectedWorkout, changedWorkout), [selectedWorkout, changedWorkout])

  useEffect(() => {
    setWorkoutExercises(selectedWorkout?.exercises || null)
  }, [selectedWorkout?.exercises])

  const onSaveWorkout = useCallback(async () => {
    if (!workoutExercises || !user || !selectedWorkout) return
    dispatch(workoutActionCreators.updateWorkout(changedWorkout))
    setIsEditMode(false)
  }, [workoutExercises, user, selectedWorkout, workoutNameInput, workoutLabels])

  const onToggleEditMode = useCallback(() => {
    if (isEditMode) {
      if (isChanged) setIsSaveChangesModal(true)
      else setIsEditMode(!isEditMode)
    } else {
      setIsEditMode(!isEditMode)
    }
  }, [isEditMode, isChanged])

  const onAddExercise = useCallback(() => {
    const uid = nanoid()
    setWorkoutExercises(prev => [...(prev || []), { ...defaultExercise, uid }])
    setNewExerciseId(uid)
  }, [])

  const onChangeExercise = useCallback(
    (exercise: ExerciseType) => {
      if (newExerciseId) setNewExerciseId('')
      setWorkoutExercises(
        prev =>
          prev?.map(ex => {
            if (ex.uid === exercise.uid) return exercise
            else return ex
          }) || null,
      )
    },
    [newExerciseId],
  )

  const onDeleteExercise = useCallback(
    (exercise: ExerciseType) => {
      if (newExerciseId) setNewExerciseId('')
      setWorkoutExercises(prev => prev?.filter(ex => ex.uid !== exercise.uid) || null)
    },
    [setWorkoutExercises, newExerciseId],
  )

  const onSaveRefuse = useCallback(() => {
    setWorkoutLabels(prev => (deepCompare(selectedWorkout.labels, prev) ? prev : selectedWorkout.labels))
    setWorkoutNameInput(prev => (deepCompare(selectedWorkout.name, prev) ? prev : selectedWorkout.name))
    setWorkoutExercises(prev => (deepCompare(selectedWorkout.exercises, prev) ? prev : selectedWorkout.exercises))
    setIsEditMode(false)
  }, [selectedWorkout.labels, selectedWorkout.name, selectedWorkout.exercises])

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ExerciseType>) => {
    return (
      <ScaleDecorator>
        <Card>
          <TouchableOpacity onLongPress={drag} disabled={isActive}>
            <ExerciseEdit
              exercise={item}
              isNewExercise={item.uid === newExerciseId}
              onSave={onChangeExercise}
              onDelete={() => onDeleteExercise(item)}
            />
          </TouchableOpacity>
        </Card>
      </ScaleDecorator>
    )
  }

  return selectedWorkout ? (
    <NestableScrollContainer>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <WorkoutDuration exercises={selectedWorkout?.exercises} />
        <FlexStart>
          <TextSecondary style={{ width: 80 }}>Edit Mode:</TextSecondary>
          <MySwitch value={isEditMode} onValueChange={onToggleEditMode} />
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
            {FUTURE_FLAG.LABELS && (
              <MyTextInput
                placeholder={'Labels:  #...'}
                onChangeText={value => setWorkoutLabels([value])}
                value={workoutLabels[0]}
                type={'secondary'}
              />
            )}
          </>
        )}
        {isEditMode ? (
          <NestableDraggableFlatList
            data={workoutExercises}
            renderItem={renderItem}
            keyExtractor={item => item.uid}
            onDragEnd={({ data }) => setWorkoutExercises(data)}
          />
        ) : (
          workoutExercises
            ?.filter(ex => ex.isVisible !== true)
            ?.map(exercise => (
              <Card key={exercise.uid}>
                <FlexSpaceBetween>
                  <TextHeader color={colors.secondPrimary}>{exercise.name}</TextHeader>
                  <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>
                </FlexSpaceBetween>
                {exercise.approaches?.map((approach, idx) => (
                  <ExerciseResult key={idx} isPrevious weight={approach.weight} repeats={approach.repeats} />
                ))}
              </Card>
            ))
        )}
      </FlexCenterColumn>
      {isEditMode && <AddMoreButton onPress={onAddExercise} header={'Exercise'} />}
      {isEditMode && <ConfirmButton disabled={!isChanged} onPress={onSaveWorkout} header={'Save workout'} />}
      {isChanged && <GoBackSubmitModal text={`Changes in '${workoutNameInput}' workout aren\`t saved!`} />}
      <AppModal
        isOpen={isSaveChangesModal}
        header={'Save changes?'}
        confirmText={'Yes, Save'}
        text={`Want to save your changes in '${workoutNameInput}' workout?`}
        onConfirm={onSaveWorkout}
        onRefuse={onSaveRefuse}
        onClose={() => setIsSaveChangesModal(false)}
      />
    </NestableScrollContainer>
  ) : (
    <Page>
      <TextSecondary>Error try reload page</TextSecondary>
    </Page>
  )
}
