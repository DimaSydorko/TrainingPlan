import * as React from 'react'
import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity, Vibration } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { updateSelectedWorkout } from '../../store/WorkoutReducer/WorkoutSlice'
import { plansActionCreators } from '../../store/PlansReducer/PlansActionCreators'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { AppHelperContext } from '../../Hooks/AppHelperProvider'
import { useAppDispatch, useWorkout } from '../../Hooks/redux'
import useWorkoutPlan from '../../Hooks/useWorkoutPlan'
import { deepCompare } from '../../Utils'
import { FUTURE_FLAG, ScreenName, VIBRATION } from '../../Utils/constants'
import { PlanType, WorkoutType } from '../../Utils/types'
import { AddMoreButton, AppModal, ConfirmButton, GoBackSubmitModal, IconButton, MyTextInput } from '../../Common'
import EditPlanWorkout from '../../Components/EditPlanWorkout/EditPlanWorkout'
import CopyWorkoutsModal from '../../Components/CopyWorkoutsModal/CopyWorkoutsModal'
import WorkoutCard from './WorkoutCard'
import { AppFooter, AppHeader, Card, FlexEnd, FlexStart, Page, TextHeader } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'

interface IPlanScreen {
  isInPlan?: boolean
}

export default memo(function WorkoutsScreen({ isInPlan = false }: IPlanScreen) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const { selectedPlan, addWorkout, deleteWorkouts, copyWorkouts } = useWorkoutPlan()
  const { onToggleTabMenu, isTabMenu } = useContext(AppHelperContext)
  const workout = useWorkout()
  const [workouts, setWorkouts] = useState<WorkoutType[]>()
  const [selectedWorkoutsUids, setSelectedWorkoutsUids] = useState<string[]>([])
  const [planNameInput, setPlanNameInput] = useState<string>(selectedPlan?.name || '')
  const [changeWorkout, setChangeWorkout] = useState<WorkoutType | null>(null)
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [isNewWorkoutModal, setIsNewWorkoutModal] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const [isCopyModal, setIsCopyModal] = useState(false)

  const isEditMode = !!selectedWorkoutsUids.length
  const workoutUids = isInPlan ? workouts?.map(w => w.uid) : []
  const isPlanEdit = isEditMode && isInPlan
  const _workouts = useMemo(
    () =>
      isInPlan
        ? workout.workoutsInPlan
            ?.slice()
            ?.filter(w => w.plansUid.includes(selectedPlan.uid))
            ?.sort((a, b) => selectedPlan?.workoutUids?.indexOf(a.uid) - selectedPlan?.workoutUids?.indexOf(b.uid))
        : workout.workouts,
    [isInPlan, workout.workoutsInPlan, workout.workouts, selectedPlan?.workoutUids, selectedPlan?.uid]
  )
  const isChanged = useMemo(
    () =>
      !deepCompare(selectedPlan, {
        ...selectedPlan,
        name: planNameInput,
        workoutUids,
      }),
    [selectedPlan, planNameInput, workoutUids]
  )

  useEffect(() => {
    setWorkouts(p => (deepCompare(_workouts, p) ? p : _workouts))
  }, [_workouts])

  useEffect(() => {
    if (isEditMode && isInPlan) {
      onToggleTabMenu(false)
      return () => onToggleTabMenu(true)
    }
  }, [isEditMode, isInPlan])

  const onSavePlan = useCallback(() => {
    if (isChanged) {
      dispatch(plansActionCreators.updatePlan({ ...selectedPlan, name: planNameInput, workoutUids }))
    }
    setSelectedWorkoutsUids([])
  }, [selectedPlan, planNameInput, workoutUids, isChanged])

  const onSaveRefuse = useCallback(() => {
    setPlanNameInput(prev => (prev === selectedPlan?.name ? prev : selectedPlan.name))
    setWorkouts(_workouts)
    setSelectedWorkoutsUids([])
  }, [selectedPlan, _workouts])

  const onAddWorkout = useCallback(
    (newWorkout: WorkoutType) => {
      if (isNewWorkoutModal) addWorkout(newWorkout, isInPlan)
      else dispatch(workoutActionCreators.updateWorkout(newWorkout))
    },
    [isNewWorkoutModal, isInPlan]
  )

  const onDelete = useCallback(() => {
    deleteWorkouts(selectedWorkoutsUids, isInPlan)
    setSelectedWorkoutsUids([])
  }, [deleteWorkouts, workouts, selectedWorkoutsUids, isInPlan])

  const onCopy = useCallback(
    (plansUid: PlanType[]) => {
      const selected = workouts.filter(workout => selectedWorkoutsUids.includes(workout.uid))
      setSelectedWorkoutsUids([])
      copyWorkouts(selected, plansUid)
    },
    [copyWorkouts, selectedWorkoutsUids]
  )

  const onWorkoutPress = useCallback(
    (workout: WorkoutType) => {
      if (isEditMode) {
        setSelectedWorkoutsUids(p => (p.includes(workout.uid) ? p.filter(p => p !== workout.uid) : [...p, workout.uid]))
      } else {
        dispatch(updateSelectedWorkout(workout))
        navigation.navigate(isInPlan ? ScreenName.WorkoutInPlan : ScreenName.Workout)
      }
    },
    [isInPlan, isEditMode]
  )

  const onWorkoutLongPress = useCallback(
    (workoutUid: string, drag: () => void) => {
      if (isEditMode) {
        if (isInPlan) {
          Vibration.vibrate(VIBRATION.BUTTON)
          drag()
        }
      } else {
        Vibration.vibrate(VIBRATION.BUTTON)
        setSelectedWorkoutsUids([workoutUid])
      }
    },
    [isInPlan, isEditMode]
  )

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<WorkoutType>) => (
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
    ),
    [onWorkoutLongPress, onWorkoutPress, selectedWorkoutsUids]
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
                iconName={icon.edit}
                onPress={() => setChangeWorkout(workouts.find(workout => workout.uid === selectedWorkoutsUids[0]))}
              />
            )}
            {FUTURE_FLAG.FRIENDS && selectedWorkoutsUids.length === 1 && (
              <IconButton iconName={icon.share} onPress={() => {}} />
            )}
            <IconButton margin={10} iconName={icon.copy} onPress={() => setIsCopyModal(true)} />
            {((selectedWorkoutsUids.length === 1 && !isInPlan) || isInPlan) && (
              <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />
            )}
          </FlexEnd>
        </AppHeader>
      )}
      <Page>
        {isPlanEdit && (
          <MyTextInput
            placeholder={'Plan name'}
            onChangeText={setPlanNameInput}
            value={planNameInput}
            type={'underline'}
          />
        )}
        <NestableScrollContainer>
          <NestableDraggableFlatList
            data={workouts || []}
            renderItem={renderItem}
            keyExtractor={item => item.uid}
            onDragEnd={({ data }) => setWorkouts(data)}
          />
        </NestableScrollContainer>
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
      {!isTabMenu && (
        <AppFooter>
          <ConfirmButton style={{ width: '80%', marginTop: 0 }} header='Save Plan' onPress={onSavePlan} />
        </AppFooter>
      )}
      <AddMoreButton onPress={() => setIsNewWorkoutModal(true)} />
      {isChanged && isInPlan && <GoBackSubmitModal text={`Changes in '${selectedPlan?.name}' plan aren\`t saved!`} />}
      <CopyWorkoutsModal
        onCopy={onCopy}
        onClose={() => setIsCopyModal(false)}
        workoutUid={selectedWorkoutsUids[0]}
        isOpen={isCopyModal}
      />
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
