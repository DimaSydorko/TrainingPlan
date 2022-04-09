import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ScreenName } from '../../Utils/constants'
import { useAppDispatch, usePlans, useUser } from '../../Hooks/redux'
import { plansActionCreators } from '../../store/PlansReducer/PlansActionCreators'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { CardPressed, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary } from '../../Theme/Parents'
import { AddMoreButton, IconButton, MySwitch } from '../../Common'
import { PlanType } from '../../Utils/types'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'

interface MyPlansScreenType {
  setPlan: (plan: PlanType) => void;
}

export default React.memo(function MyPlansScreen({ setPlan }: MyPlansScreenType) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const { plans } = usePlans()
  const { user } = useUser()
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (!user) return
    dispatch(plansActionCreators.getPlans(user.uid))
  }, [])

  const setNewPlan = async () => {
    if (!user) return
    dispatch(plansActionCreators.addPlan({
      uid: '',
      ownerUid: user.uid,
      name: 'Test Plan',
      workoutsCount: 0,
      labels: [],
      userUid: user.uid,
    }))
  }
  const onPlanPress = (plan: PlanType) => {
    setPlan(plan)
    dispatch(workoutActionCreators.getWorkouts(plan.uid))
    navigation.navigate(ScreenName.Plan)
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
            <TextSecondary style={{ width: 80 }}>
              Edit Mode:
            </TextSecondary>
            <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)} />
          </FlexStart>
        ) : null}
      </FlexSpaceBetween>
      {plans?.map(plan => (
        <CardPressed key={plan.uid} onPress={() => onPlanPress(plan)}>
          <FlexSpaceBetween>
            <View>
              <TextHeader color={colors.secondPrimary}>{plan.name}</TextHeader>
              <TextSecondary>{plan.workoutsCount} Workouts</TextSecondary>
            </View>
            {isEditMode && <IconButton iconName={icon.delete} onPress={() => onDelete(plan.uid)} />}
          </FlexSpaceBetween>
        </CardPressed>
      ))}
      {(isEditMode || !plans?.length) && <AddMoreButton onPress={setNewPlan} header={'Plan'} />}
    </Page>
  )
})