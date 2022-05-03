import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator
} from 'react-native-draggable-flatlist'
import { useAppDispatch, useUser, useWorkout } from '../../Hooks/redux'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { startPlaying } from '../../store/PlayingReduser/PlayingSlice'
import { Card, FlexCenterColumn, FlexSpaceBetween, FlexStart, Page, TextSecondary } from '../../Theme/Parents'
import {
  AddMoreButton,
  AppModal,
  ConfirmButton,
  GoBackSubmitModal,
  MySwitch,
  MyTextInput,
  WorkoutDuration
} from '../../Common'
import Exercise from '../../Components/Exercise/Exercise'
import EditExerciseModal from '../../Components/Exercise/ExerciseEditModal'
import { FUTURE_FLAG } from '../../Utils/constants'
import { deepCompare } from '../../Utils'
import { ExerciseType, WorkoutType } from '../../Utils/types'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'

export default function WorkoutScreen() {
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const { user } = useUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewExercise, setIsNewExercise] = useState(false)
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [workoutNameInput, setWorkoutNameInput] = useState<string>(selectedWorkout?.name || '')
  const [workoutLabels, setWorkoutLabels] = useState<string[]>(selectedWorkout?.labels || [])
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseType[] | null>(null)
  const [changeExercise, setChangeExercise] = useState<ExerciseType | null>(null)
  const isEmpty = !workoutExercises?.filter(ex => ex.isVisible)?.length

  const changedWorkout: WorkoutType = useMemo(
    () => ({
      ...selectedWorkout,
      name: workoutNameInput,
      labels: workoutLabels,
      exercises: workoutExercises
    }),
    [workoutNameInput, workoutLabels, workoutExercises, selectedWorkout]
  )
  const isChanged = useMemo(() => !deepCompare(selectedWorkout, changedWorkout), [selectedWorkout, changedWorkout])

  useEffect(() => {
    setWorkoutExercises(selectedWorkout?.exercises || null)
  }, [selectedWorkout?.exercises])

  useEffect(() => {
    if (!selectedWorkout.exercises?.filter(ex => ex.isVisible)?.length) setIsEditMode(true)
  }, [isEmpty])

  const onSaveWorkout = useCallback(async () => {
    if (!workoutExercises || !user || !selectedWorkout) return
    dispatch(workoutActionCreators.updateWorkout(changedWorkout))
    setIsEditMode(false)
  }, [workoutExercises, user, selectedWorkout, workoutNameInput, workoutLabels])

  const onToggleEditMode = useCallback(() => {
    if (isEditMode) {
      if (isChanged) setIsSaveChangesModal(true)
      else setIsEditMode(false)
    } else {
      setIsEditMode(true)
    }
  }, [isEditMode, isChanged])

  const onVisibilityToggle = useCallback((exercise: ExerciseType) => {
    setWorkoutExercises(prev => prev?.map(ex => (ex.uid === exercise.uid ? exercise : ex)) || [])
  }, [])

  const onDeleteExercise = useCallback(
    (exercise: ExerciseType) => {
      if (!isNewExercise) {
        setWorkoutExercises(prev => prev?.filter(ex => ex.uid !== exercise.uid) || [])
        setChangeExercise(null)
      } else setIsNewExercise(false)
    },
    [isNewExercise]
  )

  const onSaveRefuse = useCallback(() => {
    setWorkoutLabels(prev => (deepCompare(selectedWorkout.labels, prev) ? prev : selectedWorkout.labels))
    setWorkoutNameInput(prev => (deepCompare(selectedWorkout.name, prev) ? prev : selectedWorkout.name))
    setWorkoutExercises(prev => (deepCompare(selectedWorkout.exercises, prev) ? prev : selectedWorkout.exercises))
    setIsEditMode(false)
  }, [selectedWorkout.labels, selectedWorkout.name, selectedWorkout.exercises])

  const onSaveExercise = useCallback(
    (newExercise: ExerciseType) => {
      if (isNewExercise) setWorkoutExercises(prev => [...(prev || []), newExercise])
      else setWorkoutExercises(prev => prev?.map(ex => (ex.uid === newExercise.uid ? newExercise : ex)) || [])
    },
    [isNewExercise]
  )

  const onStartPlaying = useCallback(() => {
    dispatch(startPlaying(selectedWorkout))
  }, [])

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ExerciseType>) => {
    return (
      <ScaleDecorator>
        <Card borderLeftColor={item.isVisible ? `${colors.secondPrimary}` : `${colors.secondPrimary}80`}>
          <TouchableOpacity onLongPress={drag} onPress={() => setChangeExercise(item)} disabled={isActive}>
            <Exercise exercise={item} isEdit={isEditMode} onVisibilityToggle={onVisibilityToggle} />
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
        {isEditMode ? (
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
        ) : (
          <ConfirmButton
            disabled={isEmpty}
            header={'Start Workout'}
            onPress={onStartPlaying}
            style={{ marginBottom: 15, width: '100%', marginHorizontal: 100 }}
          />
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
            ?.filter(ex => ex.isVisible)
            ?.map(exercise => (
              <Card key={exercise.uid} borderLeftColor={colors.secondPrimary}>
                <Exercise exercise={exercise} />
              </Card>
            ))
        )}
      </FlexCenterColumn>
      {isEditMode && <AddMoreButton onPress={() => setIsNewExercise(true)} header={'Exercise'} />}
      {isEditMode && <ConfirmButton disabled={!isChanged} onPress={onSaveWorkout} header={'Save workout'} />}
      {isChanged && <GoBackSubmitModal text={`Changes in '${workoutNameInput}' workout aren\`t saved!`} />}
      <AppModal
        isOpen={isSaveChangesModal}
        header={'Save changes?'}
        confirmText={'Yes'}
        text={`Want to save your changes in '${workoutNameInput}' workout?`}
        onConfirm={onSaveWorkout}
        onRefuse={onSaveRefuse}
        onClose={() => setIsSaveChangesModal(false)}
      />
      {(isNewExercise || !!changeExercise) && (
        <EditExerciseModal
          exercise={changeExercise}
          onClose={() => (isNewExercise ? setIsNewExercise(false) : setChangeExercise(null))}
          onSave={onSaveExercise}
          onDelete={() => onDeleteExercise(changeExercise)}
        />
      )}
    </NestableScrollContainer>
  ) : (
    <Page>
      <TextSecondary>Error try reload page</TextSecondary>
    </Page>
  )
}
