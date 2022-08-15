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
import { changeWorkoutsPosition, updateSelectedWorkout } from '../../store/WorkoutReducer/WorkoutSlice'
import { plansAC } from '../../store/PlansReducer/PlansAC'
import { workoutAC } from '../../store/WorkoutReducer/WorkoutAC'
import { publicationsAC } from '../../store/PublicationsReducer/PublicationsAC'
import { AppHelperContext } from '../../Hooks/AppHelperProvider'
import { useAppDispatch, useWorkout } from '../../Hooks/redux'
import useWorkoutPlan from '../../Hooks/useWorkoutPlan'
import { deepCompare } from '../../Utils'
import { QUERY_LIMIT, ScreenName, VIBRATION } from '../../Utils/constants'
import { AppNavigationType, PlanType, WorkoutType } from '../../Utils/types'
import { AddMoreButton, AppModal, ConfirmButton, GoBackSubmitModal, IconButton, MyTextInput } from '../../Common'
import ShareModal from '../../Components/ShareModal/ShareModal'
import EditPlanWorkout from '../../Components/EditPlanWorkout/EditPlanWorkout'
import CopyWorkoutsModal from '../../Components/CopyWorkoutsModal/CopyWorkoutsModal'
import WorkoutCard from './WorkoutCard'
import { AppFooter, AppHeader, Card, FlexEnd, FlexStart, Page, TextHeader } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import { headerHeight } from '../../Theme/theme'

type PropsType = {
  isInPlan?: boolean
}

export default memo(function WorkoutsScreen({ isInPlan = false }: PropsType) {
  const navigation = useNavigation<AppNavigationType>()
  const dispatch = useAppDispatch()
  const { selectedPlan, addWorkout, deleteWorkouts, copyWorkouts } = useWorkoutPlan()
  const { onToggleTabMenu, isTabMenu } = useContext(AppHelperContext)
  const workoutState = useWorkout()
  const [workouts, setWorkouts] = useState<WorkoutType[]>()
  const [selectedWorkoutsUids, setSelectedWorkoutsUids] = useState<string[]>([])
  const [planNameInput, setPlanNameInput] = useState<string>(selectedPlan?.name || '')
  const [changeWorkout, setChangeWorkout] = useState<WorkoutType | null>(null)
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [isShareModal, setIsShareModal] = useState(false)
  const [isNewWorkoutModal, setIsNewWorkoutModal] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const [isCopyModal, setIsCopyModal] = useState(false)

  const isEditMode = !!selectedWorkoutsUids.length
  const isPlanEdit = isEditMode && isInPlan
  const _workouts = useMemo(
    () =>
      isInPlan
        ? selectedPlan?.workouts
        : workoutState?.workouts
            ?.slice()
            ?.sort(
              (a, b) =>
                (workoutState?.sortedWorkoutUids?.indexOf(a.uid) || 0) -
                  workoutState?.sortedWorkoutUids?.indexOf(b.uid) || 0
            ),
    [isInPlan, workoutState?.workouts, workoutState?.sortedWorkoutUids, selectedPlan?.workouts]
  )
  const isChanged = useMemo(
    () =>
      !deepCompare(selectedPlan, {
        ...selectedPlan,
        name: planNameInput,
        workouts,
      } as PlanType),
    [selectedPlan, planNameInput, workouts]
  )
  const selectedFirst = useMemo(
    () => workouts?.find(workout => workout.uid === selectedWorkoutsUids[0]),
    [workouts, selectedWorkoutsUids[0]]
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

  const onSavePlan = useCallback(
    (isClearSelected = true) => {
      if (isChanged) {
        dispatch(plansAC.updatePlan({ ...selectedPlan, name: planNameInput, workouts }))
      }
      if (isClearSelected) setSelectedWorkoutsUids([])
    },
    [isChanged, selectedPlan, workouts, planNameInput]
  )

  const onSaveRefuse = useCallback(() => {
    setPlanNameInput(prev => (prev === selectedPlan?.name ? prev : selectedPlan.name))
    setWorkouts(_workouts)
    setSelectedWorkoutsUids([])
  }, [selectedPlan, _workouts])

  const onAddWorkout = useCallback(
    (newWorkout: WorkoutType) => {
      if (isNewWorkoutModal) addWorkout(newWorkout, isInPlan)
      else {
        setSelectedWorkoutsUids([])
        if (isInPlan) dispatch(plansAC.updateSelectedPlanWorkout(newWorkout))
        else dispatch(workoutAC.updateWorkout(newWorkout))
      }
    },
    [isNewWorkoutModal, isInPlan]
  )

  const onDelete = useCallback(() => {
    deleteWorkouts(selectedWorkoutsUids, isInPlan)
    setSelectedWorkoutsUids([])
  }, [deleteWorkouts, selectedWorkoutsUids, isInPlan])

  const onCopy = useCallback(
    (plan: PlanType | undefined) => {
      const selected = workouts.filter(workout => selectedWorkoutsUids.includes(workout.uid))
      setSelectedWorkoutsUids([])
      copyWorkouts(selected, plan)
    },
    [copyWorkouts, selectedWorkoutsUids, workouts]
  )
  const onShare = useCallback(() => {
    dispatch(publicationsAC.add(selectedFirst))
    setSelectedWorkoutsUids([])
  }, [selectedFirst])

  const onWorkoutPress = useCallback(
    (workout: WorkoutType) => {
      if (isEditMode) {
        setSelectedWorkoutsUids(p => (p.includes(workout.uid) ? p.filter(p => p !== workout.uid) : [...p, workout.uid]))
        if (selectedWorkoutsUids.length === 1 && isInPlan) onSavePlan(false)
      } else {
        dispatch(updateSelectedWorkout(workout))
        navigation.navigate(isInPlan ? ScreenName.WorkoutInPlan : ScreenName.Workout)
      }
    },
    [isInPlan, isEditMode, onSavePlan, selectedWorkoutsUids.length]
  )

  const onWorkoutLongPress = useCallback(
    (workoutUid: string, drag: () => void) => {
      if (isEditMode) {
        Vibration.vibrate(VIBRATION.BUTTON)
        drag()
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
            <WorkoutCard workout={item} isSelected={selectedWorkoutsUids.includes(item.uid)} />
          </TouchableOpacity>
        </Card>
      </ScaleDecorator>
    ),
    [onWorkoutLongPress, onWorkoutPress, selectedWorkoutsUids]
  )

  return (
    <>
      {isEditMode && (
        <AppHeader style={{ justifyContent: 'space-between' }}>
          <FlexStart>
            <IconButton iconName={icon.close} onPress={() => setSelectedWorkoutsUids([])} />
            <TextHeader>{selectedWorkoutsUids.length}</TextHeader>
            {workouts.length > selectedWorkoutsUids.length && (
              <IconButton
                margin={10}
                iconName={icon.checkAll}
                onPress={() => setSelectedWorkoutsUids(workouts.map(w => w.uid))}
              />
            )}
          </FlexStart>
          <FlexEnd style={{ width: 250 }}>
            {selectedWorkoutsUids.length === 1 && (
              <IconButton iconName={icon.share} margin={10} onPress={() => setIsShareModal(true)} />
            )}
            {selectedWorkoutsUids.length === 1 && (
              <IconButton
                iconName={icon.edit}
                onPress={() => setChangeWorkout(workouts.find(workout => workout.uid === selectedWorkoutsUids[0]))}
              />
            )}
            <IconButton margin={10} iconName={icon.copy} onPress={() => setIsCopyModal(true)} />
            {!!selectedWorkoutsUids.length && (
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
        <NestableScrollContainer style={{ paddingBottom: headerHeight }}>
          <NestableDraggableFlatList
            data={workouts || []}
            renderItem={renderItem}
            keyExtractor={item => item.uid}
            onDragEnd={({ data }) =>
              isInPlan ? setWorkouts(data) : dispatch(changeWorkoutsPosition(data.map(w => w.uid)))
            }
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
      {workouts?.length <= QUERY_LIMIT && <AddMoreButton onPress={() => setIsNewWorkoutModal(true)} />}
      {isChanged && isInPlan && <GoBackSubmitModal text={`Changes in '${selectedPlan?.name}' plan aren\`t saved!`} />}
      <CopyWorkoutsModal
        isInPlan={isInPlan}
        isOpen={isCopyModal}
        onCopy={onCopy}
        onClose={() => setIsCopyModal(false)}
      />
      <ShareModal
        isOpen={isShareModal}
        onShare={onShare}
        onClose={() => setIsShareModal(false)}
        workout={selectedFirst}
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
