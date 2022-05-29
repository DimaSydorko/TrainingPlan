import * as React from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity, Vibration } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator
} from 'react-native-draggable-flatlist'
import { updateSelectedWorkout } from '../../store/WorkoutReducer/WorkoutSlice'
import { plansActionCreators } from '../../store/PlansReducer/PlansActionCreators'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import useWorkoutPlan from '../../Hooks/useWorkoutPlan'
import { useAppDispatch, useWorkout } from '../../Hooks/redux'
import { deepCompare } from '../../Utils'
import { ScreenName, VIBRATION } from '../../Utils/constants'
import { WorkoutType } from '../../Utils/types'
import { AddMoreButton, AppModal, ConfirmButton, GoBackSubmitModal, IconButton, MyTextInput } from '../../Common'
import EditPlanWorkout from '../../Components/EditPlanWorkout/EditPlanWorkout'
import WorkoutCard from './WorkoutCard'
import { AppHeader, Card, FlexEnd, FlexStart, Page, TextHeader } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'

interface IPlanScreen {
  isInPlan?: boolean
}

export default memo(function WorkoutsScreen({ isInPlan = false }: IPlanScreen) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const { selectedPlan, addWorkout, deleteWorkout, addWorkoutInPlane, deleteWorkoutInPlane } = useWorkoutPlan()
  const workout = useWorkout()
  const [workouts, setWorkouts] = useState<WorkoutType[]>()
  const [selectedWorkoutsUids, setSelectedWorkoutsUids] = useState<string[]>([])
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [isNewWorkoutModal, setIsNewWorkoutModal] = useState(false)
  const [changeWorkout, setChangeWorkout] = useState<WorkoutType | null>(null)
  const [planNameInput, setPlanNameInput] = useState<string>(selectedPlan?.name || '')
  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const isEditMode = !!selectedWorkoutsUids.length
  const workoutUids = isInPlan ? workouts?.map(w => w.uid) : []
  const isPlanEdit = isEditMode && isInPlan
  const _workouts = useMemo(
    () =>
      isInPlan
        ? workout.workoutsInPlan
            ?.slice()
            ?.sort((a, b) => selectedPlan.workoutUids.indexOf(a.uid) - selectedPlan.workoutUids.indexOf(b.uid))
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

  const onSavePlan = useCallback(() => {
    dispatch(plansActionCreators.updatePlan({ ...selectedPlan, name: planNameInput, workoutUids }))
    setSelectedWorkoutsUids([])
  }, [selectedPlan, planNameInput, workoutUids])

  const onSaveRefuse = useCallback(() => {
    setPlanNameInput(prev => (prev === selectedPlan?.name ? prev : selectedPlan.name))
    setWorkouts(_workouts)
    setSelectedWorkoutsUids([])
  }, [selectedPlan, _workouts])

  const onAddWorkout = useCallback(
    (newWorkout: WorkoutType) => {
      if (isNewWorkoutModal) isInPlan ? addWorkoutInPlane(newWorkout) : addWorkout(newWorkout)
      else dispatch(workoutActionCreators.updateWorkout(newWorkout))
    },
    [isNewWorkoutModal]
  )

  const onDelete = useCallback(() => {
    selectedWorkoutsUids.forEach(uid => {
      const workout = workouts.find(workout => workout.uid === uid)
      isInPlan ? deleteWorkoutInPlane(workout) : deleteWorkout(workout)
    })
    setSelectedWorkoutsUids([])
  }, [deleteWorkoutInPlane, deleteWorkout, workouts, selectedWorkoutsUids])

  const onWorkoutPress = (workout: WorkoutType) => {
    if (isEditMode) {
      setSelectedWorkoutsUids(p => (p.includes(workout.uid) ? p.filter(p => p !== workout.uid) : [...p, workout.uid]))
    } else {
      dispatch(updateSelectedWorkout(workout))
      navigation.navigate(isInPlan ? ScreenName.WorkoutInPlan : ScreenName.Workout)
    }
  }
  const onWorkoutLongPress = (workoutUid: string, drag: () => void) => {
    if (isEditMode) {
      if (isInPlan) {
        Vibration.vibrate(VIBRATION.BUTTON)
        drag()
      }
    } else {
      Vibration.vibrate(VIBRATION.BUTTON)
      setSelectedWorkoutsUids([workoutUid])
    }
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<WorkoutType>) => (
    <ScaleDecorator>
      <Card>
        <TouchableOpacity
          onLongPress={() => onWorkoutLongPress(item.uid, drag)}
          onPress={() => onWorkoutPress(item)}
          disabled={isActive}
        >
          <WorkoutCard workout={item} isInPlan={isInPlan} isSelected={selectedWorkoutsUids.includes(item.uid)} />
        </TouchableOpacity>
      </Card>
    </ScaleDecorator>
  )

  return (
    <>
      {isEditMode && (
        <AppHeader>
          <FlexStart>
            <IconButton iconName={icon.close} onPress={() => setSelectedWorkoutsUids([])} />
            <TextHeader>{selectedWorkoutsUids.length}</TextHeader>
          </FlexStart>
          <FlexEnd>
            {selectedWorkoutsUids.length === 1 && (
              <IconButton
                margin={10}
                iconName={icon.edit}
                onPress={() => setChangeWorkout(workouts.find(workout => workout.uid === selectedWorkoutsUids[0]))}
              />
            )}
            <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />
          </FlexEnd>
        </AppHeader>
      )}
      <Page>
        <NestableScrollContainer>
          {isPlanEdit && (
            <MyTextInput
              placeholder={'Plan name'}
              onChangeText={setPlanNameInput}
              value={planNameInput}
              type={'underline'}
            />
          )}
          <NestableDraggableFlatList
            data={workouts || []}
            renderItem={renderItem}
            keyExtractor={item => item.uid}
            onDragEnd={({ data }) => setWorkouts(data)}
          />
        </NestableScrollContainer>
        {(isEditMode || !workouts?.length) && (
          <AddMoreButton onPress={() => setIsNewWorkoutModal(true)} header={'Workout'} />
        )}
        {isPlanEdit && <ConfirmButton header={'Save Plan'} disabled={!isChanged} onPress={onSavePlan} />}
        {isChanged && isInPlan && <GoBackSubmitModal text={`Changes in '${selectedPlan?.name}' plan aren\`t saved!`} />}
        {(isNewWorkoutModal || !!changeWorkout) && (
          <EditPlanWorkout
            isModal
            type={'Workout'}
            initialValue={changeWorkout}
            onSubmit={onAddWorkout}
            onClose={() => (isNewWorkoutModal ? setIsNewWorkoutModal(false) : setChangeWorkout(null))}
          />
        )}
      </Page>
      <AppModal
        isOpen={isSaveChangesModal}
        header={'Save changes?'}
        confirmText={'Yes'}
        text={`Want to save your changes in '${planNameInput}' plan?`}
        onConfirm={onSavePlan}
        onRefuse={onSaveRefuse}
        onClose={() => setIsSaveChangesModal(false)}
      />
      <AppModal
        isWarning
        header={`Delete plan${selectedWorkoutsUids.length === 1 ? '' : 's'}`}
        text={`Are you sure you want to delete ${
          selectedWorkoutsUids.length === 1
            ? `'${workouts.find(plan => plan.uid === selectedWorkoutsUids[0]).name}'`
            : selectedWorkoutsUids.length
        } workout${selectedWorkoutsUids.length === 1 ? '' : 's'}?`}
        confirmText='Yes, delete'
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
        onConfirm={() => onDelete()}
      />
    </>
  )
})
