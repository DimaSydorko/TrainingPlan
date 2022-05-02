import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { selectPlan } from '../../store/PlansReducer/PlansSlice'
import { plansActionCreators } from '../../store/PlansReducer/PlansActionCreators'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { useAppDispatch, usePlans, useUser } from '../../Hooks/redux'
import { FlexSpaceBetween, FlexStart, Page, TextSecondary } from '../../Theme/Parents'
import { AddMoreButton, MySwitch } from '../../Common'
import EditPlanWorkout from '../../Components/EditPlanWorkout/EditPlanWorkout'
import PlanCard from './PlanCard'
import { ScreenName } from '../../Utils/constants'
import { PlanType } from '../../Utils/types'
import { theme } from '../../Theme/theme'

export default memo(function MyPlansScreen() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const { plans } = usePlans()
  const { user } = useUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewPlanModal, setIsNewPlanModal] = useState(false)
  const [changePlan, setChangePlan] = useState<PlanType | null>(null)

  useEffect(() => {
    if (!user) return
    dispatch(plansActionCreators.getPlans(user.uid))
  }, [])

  const onAddPlan = useCallback((newPlan: PlanType) => {
    if (isNewPlanModal) dispatch(plansActionCreators.addPlan(newPlan))
    else dispatch(plansActionCreators.updatePlan(newPlan))
  }, [])

  const onPlanPress = (plan: PlanType) => {
    if (isEditMode) {
      setChangePlan(plan)
    } else {
      dispatch(selectPlan(plan))
      dispatch(workoutActionCreators.getWorkouts({ uid: plan.uid, findBy: 'planUid' }))
      navigation.navigate(ScreenName.Plan)
    }
  }

  const onDelete = (planUid: string) => {
    dispatch(plansActionCreators.deletePlan(planUid))
  }

  return (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <View />
        {plans?.length ? (
          <FlexStart>
            <TextSecondary style={{ width: 80 }}>Edit Mode:</TextSecondary>
            <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)} />
          </FlexStart>
        ) : null}
      </FlexSpaceBetween>
      {plans?.map(plan => (
        <PlanCard
          key={plan.uid}
          plan={plan}
          isEditMode={isEditMode}
          onSelect={() => onPlanPress(plan)}
          onDelete={() => onDelete(plan.uid)}
        />
      ))}
      {(isEditMode || !plans?.length) && <AddMoreButton onPress={() => setIsNewPlanModal(true)} header={'Plan'} />}
      {(isNewPlanModal || !!changePlan) && (
        <EditPlanWorkout
          isModal
          type={'Plan'}
          initialValue={changePlan}
          onSubmit={onAddPlan}
          onClose={() => (isNewPlanModal ? setIsNewPlanModal(false) : setChangePlan(null))}
        />
      )}
    </Page>
  )
})
