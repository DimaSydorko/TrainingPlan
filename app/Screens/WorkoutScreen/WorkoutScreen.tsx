import * as React from 'react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { useAppDispatch, useSettings, useUser, useWorkout } from '../../Hooks/redux'
import { workoutAC } from '../../store/WorkoutReducer/WorkoutAC'
import { plansAC } from '../../store/PlansReducer/PlansAC'
import { AppHelperContext } from '../../Hooks/AppHelperProvider'
import { AddMoreButton, AppModal, ConfirmButton, GoBackSubmitModal, MyTextInput, WorkoutDuration } from '../../Common'
import Exercise from '../../Components/Exercise/Exercise'
import EditExerciseModal from '../../Components/Exercise/ExerciseEditModal'
import { deepCompare } from '../../Utils'
import { appScreen, ScreenName } from '../../Utils/constants'
import { AppNavigationType, ExerciseType, WorkoutType } from '../../Utils/types'
import {
  AppFooter,
  AppHeader,
  Card,
  FlexCenterColumn,
  FlexSpaceBetween,
  Page,
  TextSecondary,
} from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import { theme } from '../../Theme/theme'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'

export default function WorkoutScreen() {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<AppNavigationType>()
  const { selectedWorkout } = useWorkout()
  const { colors } = useSettings()
  const { user } = useUser()
  const { onToggleTabMenu } = useContext(AppHelperContext)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewExercise, setIsNewExercise] = useState(false)
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [workoutNameInput, setWorkoutNameInput] = useState<string>(selectedWorkout?.name || '')
  const [workoutLabels, setWorkoutLabels] = useState<string[]>(selectedWorkout?.labels || [])
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseType[] | null>(null)
  const [changeExercise, setChangeExercise] = useState<ExerciseType | null>(null)
  const isEmpty = !workoutExercises?.filter(ex => ex.isVisible)?.length
  const isDarkTheme = colors.primary === colorsDark.primary

  const changedWorkout: WorkoutType = useMemo(
    () => ({
      ...selectedWorkout,
      name: workoutNameInput,
      labels: workoutLabels,
      exercises: workoutExercises,
    }),
    [workoutNameInput, workoutLabels, workoutExercises, selectedWorkout]
  )
  const isChanged = !deepCompare(selectedWorkout, changedWorkout)

  useEffect(() => {
    onToggleTabMenu(false)
    return () => {
      onToggleTabMenu(true)
    }
  }, [])

  useEffect(() => {
    if (isChanged && !isEditMode) setWorkoutExercises(selectedWorkout?.exercises || null)
  }, [isChanged, isEditMode])

  useEffect(() => {
    if (!selectedWorkout?.exercises?.filter(ex => ex.isVisible)?.length) setIsEditMode(true)
  }, [isEmpty])

  const onSaveWorkout = useCallback(async () => {
    if (!workoutExercises || !user || !selectedWorkout) return
    if (isChanged) {
      if (changedWorkout?.ownerUid) dispatch(workoutAC.updateWorkout(changedWorkout))
      else dispatch(plansAC.updateSelectedPlanWorkout(changedWorkout))
    }
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
    (newExercise: ExerciseType, isNew = false, idx: undefined | number = undefined) => {
      if (isNewExercise || isNew) {
        setWorkoutExercises(prev => {
          if (idx === undefined) return [...(prev || []), newExercise]
          else {
            const _prev = [...(prev || [])]
            _prev.splice(idx, 0, newExercise)
            return _prev
          }
        })
      } else setWorkoutExercises(prev => prev?.map(ex => (ex.uid === newExercise.uid ? newExercise : ex)) || [])
    },
    [isNewExercise]
  )

  const onStartPlaying = useCallback(() => navigation.push(ScreenName.Playing), [])

  const onGoBack = useCallback(() => {
    onSaveRefuse()
    navigation.goBack()
  }, [onSaveRefuse])

  const renderItem = useCallback(
    ({ item, drag, isActive, index }: RenderItemParams<ExerciseType>) => {
      const color = COLORS_EXERCISE[item?.colorIdx || 0][+isDarkTheme]
      return (
        <ScaleDecorator>
          <Card borderLeftColor={item.isVisible ? `${color}` : `${color}80`}>
            <TouchableOpacity onLongPress={drag} onPress={() => setChangeExercise(item)} disabled={isActive}>
              <Exercise
                idx={index}
                exercise={item}
                isEdit={isEditMode}
                color={color}
                onCopy={onSaveExercise}
                onVisibilityToggle={onVisibilityToggle}
                onDelete={onDeleteExercise}
              />
            </TouchableOpacity>
          </Card>
        </ScaleDecorator>
      )
    },
    [isEditMode, onVisibilityToggle, onSaveExercise, isDarkTheme, onDeleteExercise]
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
                style={{ height: appScreen.header - 2 }}
              />
            </AppHeader>
          )}
          <Page scrollDisabled>
            <FlexCenterColumn style={{ paddingHorizontal: 8 }}>
              <NestableScrollContainer
                style={{
                  height: appScreen.vh - appScreen.footer - appScreen.header,
                  marginBottom: appScreen.footer,
                }}
              >
                {isEditMode && !!workoutExercises.length ? (
                  <NestableDraggableFlatList
                    renderItem={renderItem}
                    data={workoutExercises}
                    dragItemOverflow
                    autoscrollSpeed={40}
                    style={{ paddingVertical: 10 }}
                    keyExtractor={(item, idx) => item.uid + idx}
                    onDragEnd={({ data }) => setWorkoutExercises(data)}
                  />
                ) : (
                  <>
                    <FlexSpaceBetween style={theme.containers.secondHeader}>
                      <WorkoutDuration exercises={selectedWorkout?.exercises} />
                    </FlexSpaceBetween>
                    {workoutExercises
                      ?.filter(ex => ex.isVisible)
                      ?.map(exercise => {
                        const color = COLORS_EXERCISE[exercise?.colorIdx || 0][+isDarkTheme]
                        return (
                          <Card key={exercise.uid} borderLeftColor={color}>
                            <Exercise exercise={exercise} color={color} />
                          </Card>
                        )
                      })}
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
              <ConfirmButton isFooter onPress={onSaveWorkout} header={'Save workout'} />
            ) : (
              <ConfirmButton isFooter disabled={isEmpty} header={'Start Workout'} onPress={onStartPlaying} />
            )}
            {isChanged && (
              <GoBackSubmitModal
                text={`Changes in '${workoutNameInput}' workout aren\`t saved!`}
                onConfirm={onGoBack}
              />
            )}
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
