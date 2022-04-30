import * as React from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { View } from 'react-native'
import { selectWorkout } from '../../store/WorkoutReducer/WorkoutSlice'
import { plansActionCreators } from '../../store/PlansReducer/PlansActionCreators'
import useWorkoutPlan from '../../Hooks/useWorkoutPlan'
import { useAppDispatch, usePlans, useUser, useWorkout } from '../../Hooks/redux'
import { WorkoutType } from '../../Utils/types'
import { defaultWorkout, ScreenName } from '../../Utils/constants'
import { AddMoreButton, AppModal, ConfirmButton, GoBackSubmitModal, MySwitch, MyTextInput } from '../../Common'
import WorkoutCard from './WorkoutCard'
import { FlexSpaceBetween, FlexStart, Page, TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import { deepCompare } from '../../Utils'

interface IPlanScreen {
  isInPlan?: boolean
}

export default memo(function WorkoutsScreen({ isInPlan = false }: IPlanScreen) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const workout = useWorkout()
  const { selectedPlan } = usePlans()
  const { user } = useUser()
  const { addWorkout, deleteWorkout, addWorkoutInPlane, deleteWorkoutInPlane } = useWorkoutPlan()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaveChangesModal, setIsSaveChangesModal] = useState(false)
  const [planNameInput, setPlanNameInput] = useState<string>(selectedPlan?.name || '')
  const workouts = isInPlan ? workout.workoutsInPlan : workout.workouts
  const isChanged = useMemo(
    () =>
      !deepCompare(selectedPlan, {
        ...selectedPlan,
        name: planNameInput
      }),
    [selectedPlan, planNameInput]
  )

  const onSelect = useCallback(
    (workout: WorkoutType) => {
      dispatch(selectWorkout(workout))
      navigation.navigate(isInPlan ? ScreenName.WorkoutInPlan : ScreenName.Workout)
    },
    [isInPlan]
  )

  const onToggleEditMode = useCallback(() => {
    if (isEditMode) {
      if (isChanged) setIsSaveChangesModal(true)
      else setIsEditMode(!isEditMode)
    } else {
      setIsEditMode(!isEditMode)
    }
  }, [isEditMode, isChanged])

  const onSavePlan = useCallback(() => {
    dispatch(plansActionCreators.updatePlan({ ...selectedPlan, name: planNameInput }))
    setIsEditMode(false)
  }, [selectedPlan, planNameInput])

  const onSaveRefuse = useCallback(() => {
    setPlanNameInput(prev => (prev === selectedPlan.name ? prev : selectedPlan.name))
  }, [selectedPlan])

  const onAddWorkout = () => {
    if (!user) return
    const newWorkout = { ...defaultWorkout, ownerUid: user.uid }
    isInPlan ? addWorkoutInPlane(newWorkout) : addWorkout(newWorkout)
  }

  const onDelete = useCallback(
    (workout: WorkoutType) => {
      isInPlan ? deleteWorkoutInPlane(workout) : deleteWorkout(workout)
    },
    [deleteWorkoutInPlane, deleteWorkout, isInPlan]
  )

  return (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <View />
        {workouts?.length ? (
          <FlexStart>
            <TextSecondary style={{ width: 80 }}>Edit Mode:</TextSecondary>
            <MySwitch value={isEditMode} onValueChange={onToggleEditMode} />
          </FlexStart>
        ) : null}
      </FlexSpaceBetween>
      {isEditMode && isInPlan && (
        <MyTextInput
          placeholder={'Plan name'}
          onChangeText={setPlanNameInput}
          value={planNameInput}
          type={'underline'}
        />
      )}
      {workouts?.map(workout => (
        <WorkoutCard
          key={workout.uid}
          workout={workout}
          isInPlan={isInPlan}
          isEditMode={isEditMode}
          onSelect={() => onSelect(workout)}
          onDelete={() => onDelete(workout)}
        />
      ))}
      {(isEditMode || !workouts?.length) && <AddMoreButton onPress={onAddWorkout} header={'Workout'} />}
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
