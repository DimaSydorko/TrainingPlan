import * as React from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator
} from 'react-native-draggable-flatlist'
import { selectWorkout } from '../../store/WorkoutReducer/WorkoutSlice'
import { plansActionCreators } from '../../store/PlansReducer/PlansActionCreators'
import useWorkoutPlan from '../../Hooks/useWorkoutPlan'
import { useAppDispatch, useWorkout } from '../../Hooks/redux'
import { WorkoutType } from '../../Utils/types'
import { ScreenName } from '../../Utils/constants'
import { AppModal, ConfirmButton, GoBackSubmitModal, MySwitch, MyTextInput } from '../../Common'
import WorkoutCard from './WorkoutCard'
import CreateWorkout from './CreateWorkout'
import { Card, CardPressed, FlexSpaceBetween, FlexStart, Page, TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import { deepCompare } from '../../Utils'

interface IPlanScreen {
  isInPlan?: boolean
}

export default memo(function WorkoutsScreen({ isInPlan = false }: IPlanScreen) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const { selectedPlan, addWorkout, deleteWorkout, addWorkoutInPlane, deleteWorkoutInPlane } = useWorkoutPlan()
  const workout = useWorkout()
  const [workouts, setWorkouts] = useState<WorkoutType[]>()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [planNameInput, setPlanNameInput] = useState<string>(selectedPlan?.name || '')

  const workoutUids = isInPlan ? workouts?.map(w => w.uid) : []
  const isPlanEdit = isEditMode && isInPlan
  const _workouts = useMemo(
    () =>
      isInPlan
        ? workout.workoutsInPlan
            .slice()
            .sort((a, b) => selectedPlan.workoutUids.indexOf(a.uid) - selectedPlan.workoutUids.indexOf(b.uid))
        : workout.workouts,
    [isInPlan, workout.workoutsInPlan, workout.workouts]
  )
  const isChanged = useMemo(
    () =>
      !deepCompare(selectedPlan, {
        ...selectedPlan,
        name: planNameInput,
        workoutUids
      }),
    [selectedPlan, planNameInput, workoutUids]
  )

  useEffect(() => {
    setWorkouts(_workouts)
  }, [_workouts])

  const onSelect = useCallback((workout: WorkoutType) => {
    dispatch(selectWorkout(workout))
    navigation.navigate(isInPlan ? ScreenName.WorkoutInPlan : ScreenName.Workout)
  }, [])

  const onToggleEditMode = useCallback(() => {
    if (isEditMode) {
      if (isChanged && isInPlan) setIsSaveChangesModal(true)
      else setIsEditMode(!isEditMode)
    } else {
      setIsEditMode(!isEditMode)
    }
  }, [isEditMode, isChanged])

  const onSavePlan = useCallback(() => {
    dispatch(plansActionCreators.updatePlan({ ...selectedPlan, name: planNameInput, workoutUids }))
    setIsEditMode(false)
  }, [selectedPlan, planNameInput, workoutUids])

  const onSaveRefuse = useCallback(() => {
    setPlanNameInput(prev => (prev === selectedPlan.name ? prev : selectedPlan.name))
    setWorkouts(_workouts)
    setIsEditMode(false)
  }, [selectedPlan, _workouts])

  const onAddWorkout = useCallback((newWorkout: WorkoutType) => {
    isInPlan ? addWorkoutInPlane(newWorkout) : addWorkout(newWorkout)
  }, [])

  const onDelete = useCallback(
    (workout: WorkoutType) => {
      isInPlan ? deleteWorkoutInPlane(workout) : deleteWorkout(workout)
    },
    [deleteWorkoutInPlane, deleteWorkout]
  )

  const renderItem = ({ item, drag, isActive }: RenderItemParams<WorkoutType>) => (
    <ScaleDecorator>
      <Card>
        <TouchableOpacity onLongPress={drag} disabled={isActive}>
          <WorkoutCard workout={item} isInPlan={isInPlan} isEditMode={isEditMode} onDelete={() => onDelete(item)} />
        </TouchableOpacity>
      </Card>
    </ScaleDecorator>
  )

  return (
    <Page>
      <NestableScrollContainer>
        <FlexSpaceBetween style={theme.containers.secondHeader}>
          <View />
          {workouts?.length ? (
            <FlexStart>
              <TextSecondary style={{ width: 80 }}>Edit Mode:</TextSecondary>
              <MySwitch value={isEditMode} onValueChange={onToggleEditMode} />
            </FlexStart>
          ) : null}
        </FlexSpaceBetween>
        {isPlanEdit && (
          <MyTextInput
            placeholder={'Plan name'}
            onChangeText={setPlanNameInput}
            value={planNameInput}
            type={'underline'}
          />
        )}
        {isPlanEdit ? (
          <NestableDraggableFlatList
            data={workouts}
            renderItem={renderItem}
            keyExtractor={item => item.uid}
            onDragEnd={({ data }) => setWorkouts(data)}
          />
        ) : (
          workouts?.map(workout => (
            <CardPressed key={workout.uid} onPress={() => !isEditMode && onSelect(workout)}>
              <WorkoutCard
                workout={workout}
                isInPlan={isInPlan}
                isEditMode={isEditMode}
                onDelete={() => onDelete(workout)}
              />
            </CardPressed>
          ))
        )}
      </NestableScrollContainer>
      {(isEditMode || !workouts?.length) && <CreateWorkout onAddWorkout={onAddWorkout} />}
      {isEditMode && isInPlan && <ConfirmButton header={'Save Plan'} disabled={!isChanged} onPress={onSavePlan} />}
      {isChanged && isInPlan && <GoBackSubmitModal text={`Changes in '${selectedPlan.name}' plan aren\`t saved!`} />}
      <AppModal
        isOpen={isSaveChangesModal}
        header={'Save changes?'}
        confirmText={'Yes, Save'}
        text={`Want to save your changes in '${planNameInput}' plan?`}
        onConfirm={onSavePlan}
        onRefuse={onSaveRefuse}
        onClose={() => setIsSaveChangesModal(false)}
      />
    </Page>
  )
})
