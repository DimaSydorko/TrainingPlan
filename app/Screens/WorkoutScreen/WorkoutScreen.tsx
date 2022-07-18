import * as React from 'react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { useAppDispatch, useSettings, useUser, useWorkout } from '../../Hooks/redux'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { AppHelperContext } from '../../Hooks/AppHelperProvider'
import {
  AppFooter,
  AppHeader,
  Card,
  FlexCenterColumn,
  FlexSpaceBetween,
  Page,
  TextSecondary,
} from '../../Theme/Parents'
import { AddMoreButton, AppModal, ConfirmButton, GoBackSubmitModal, MyTextInput, WorkoutDuration } from '../../Common'
import Exercise from '../../Components/Exercise/Exercise'
import EditExerciseModal from '../../Components/Exercise/ExerciseEditModal'
import { FUTURE_FLAG, screen } from '../../Utils/constants'
import { deepCompare } from '../../Utils'
import { ExerciseType, WorkoutType } from '../../Utils/types'
import { headerHeight, theme } from '../../Theme/theme'
import { icon } from '../../Theme/icons'

export default function WorkoutScreen() {
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const { colors } = useSettings()
  const { user } = useUser()
  const { onTogglePlaying, onToggleTabMenu } = useContext(AppHelperContext)
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
      exercises: workoutExercises,
    }),
    [workoutNameInput, workoutLabels, workoutExercises, selectedWorkout]
  )
  const isChanged = useMemo(() => !deepCompare(selectedWorkout, changedWorkout), [selectedWorkout, changedWorkout])

  useEffect(() => {
    onToggleTabMenu(false)
    return () => {
      onToggleTabMenu(true)
    }
  }, [])

  useEffect(() => {
    setWorkoutExercises(selectedWorkout?.exercises || null)
  }, [selectedWorkout?.exercises])

  useEffect(() => {
    if (!selectedWorkout?.exercises?.filter(ex => ex.isVisible)?.length) setIsEditMode(true)
  }, [isEmpty])

  const onSaveWorkout = useCallback(async () => {
    if (!workoutExercises || !user || !selectedWorkout) return
    if (isChanged) dispatch(workoutActionCreators.updateWorkout(changedWorkout))
    setIsEditMode(false)
  }, [workoutExercises, user, selectedWorkout, isChanged, changedWorkout])

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
    setWorkoutLabels(prev => (deepCompare(selectedWorkout?.labels, prev) ? prev : selectedWorkout?.labels))
    setWorkoutNameInput(prev => (deepCompare(selectedWorkout?.name, prev) ? prev : selectedWorkout?.name))
    setWorkoutExercises(prev => (deepCompare(selectedWorkout?.exercises, prev) ? prev : selectedWorkout?.exercises))
    setIsEditMode(false)
  }, [selectedWorkout?.labels, selectedWorkout?.name, selectedWorkout?.exercises])

  const onSaveExercise = useCallback(
    (newExercise: ExerciseType, isNew = false) => {
      if (isNewExercise || isNew) setWorkoutExercises(prev => [...(prev || []), newExercise])
      else setWorkoutExercises(prev => prev?.map(ex => (ex.uid === newExercise.uid ? newExercise : ex)) || [])
    },
    [isNewExercise]
  )

  const onStartPlaying = useCallback(() => {
    onTogglePlaying()
  }, [])

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ExerciseType>) => {
      const color = item.color || colors.primary
      return (
        <ScaleDecorator>
          <Card borderLeftColor={item.isVisible ? `${color}` : `${color}80`}>
            <TouchableOpacity onLongPress={drag} onPress={() => setChangeExercise(item)} disabled={isActive}>
              <Exercise
                exercise={item}
                isEdit={isEditMode}
                onCopy={onSaveExercise}
                onVisibilityToggle={onVisibilityToggle}
                onDelete={onDeleteExercise}
              />
            </TouchableOpacity>
          </Card>
        </ScaleDecorator>
      )
    },
    [isEditMode, onVisibilityToggle, onSaveExercise]
  )

  return (
    <>
      {selectedWorkout ? (
        <>
          {isEditMode && (
            <AppHeader>
              <MyTextInput
                placeholder={'Workout Name'}
                onChangeText={workoutName => setWorkoutNameInput(workoutName)}
                value={workoutNameInput}
                type={'underline'}
              />
            </AppHeader>
          )}
          <Page scrollDisabled>
            <FlexCenterColumn style={{ paddingHorizontal: 8 }}>
              {isEditMode && (
                <>
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
              <NestableScrollContainer
                style={{
                  height: screen.vh - headerHeight * 2,
                  marginBottom: headerHeight,
                }}
              >
                {isEditMode ? (
                  <NestableDraggableFlatList
                    renderItem={renderItem}
                    data={workoutExercises}
                    dragItemOverflow
                    autoscrollSpeed={40}
                    style={{ paddingBottom: 10 }}
                    keyExtractor={item => item.uid}
                    onDragEnd={({ data }) => setWorkoutExercises(data)}
                  />
                ) : (
                  <>
                    <FlexSpaceBetween style={theme.containers.secondHeader}>
                      <WorkoutDuration exercises={selectedWorkout?.exercises} />
                    </FlexSpaceBetween>
                    {workoutExercises
                      ?.filter(ex => ex.isVisible)
                      ?.map(exercise => (
                        <Card key={exercise.uid} borderLeftColor={exercise.color || colors.primary}>
                          <Exercise exercise={exercise} />
                        </Card>
                      ))}
                  </>
                )}
              </NestableScrollContainer>
            </FlexCenterColumn>
          </Page>
          <AddMoreButton
            icon={isEditMode ? icon.plus : icon.edit}
            onPress={() => (isEditMode ? setIsNewExercise(true) : setIsEditMode(true))}
          />
          <AppFooter>
            {isEditMode ? (
              <ConfirmButton onPress={onSaveWorkout} header={'Save workout'} style={{ marginTop: 0, width: '90%' }} />
            ) : (
              <ConfirmButton
                disabled={isEmpty}
                header={'Start Workout'}
                onPress={onStartPlaying}
                style={{ marginTop: 0, width: '90%' }}
              />
            )}
            {isChanged && <GoBackSubmitModal text={`Changes in '${workoutNameInput}' workout aren\`t saved!`} />}
          </AppFooter>
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
        </>
      ) : (
        <Page>
          <TextSecondary>Error try reload page</TextSecondary>
        </Page>
      )}
    </>
  )
}
