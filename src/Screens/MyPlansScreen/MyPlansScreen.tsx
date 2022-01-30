import React, {useContext, useState} from "react";
import {View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {ScreenName} from "../../Utils/constants";
import {AuthContext, PlansContext, WorkoutContext} from "../../Providers";
import {CardPressed, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary} from "../../Theme/Parents";
import {AddMoreButton, IconButton, MySwitch} from "../../Common";
import {PlanType} from "../../Utils/types";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";
import {icon} from "../../Theme/icons";

interface MyPlansScreenType {
  setPlan: (plan: PlanType) => void;
}

export default React.memo(function MyPlansScreen({setPlan}: MyPlansScreenType) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const {plans, addPlan, updatePlan, deletePlan} = useContext(PlansContext)
  const {getWorkouts} = useContext(WorkoutContext)
  const {user} = useContext(AuthContext)
  const [isEditMode, setIsEditMode] = useState(false)

  const setNewPlan = async () => {
    if (user) {
      await addPlan({
        uid: '',
        ownerUid: user.uid,
        name: 'Test Plan',
        workoutsCount: 0,
        labels: [],
      })
    }
  }
  const onPlanPress = (plan: PlanType) => {
    setPlan(plan)
    getWorkouts(plan.uid)
    navigation.navigate(ScreenName.Plan)
  }

  return (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <View/>
        {plans?.length ? (
          <FlexStart>
            <TextSecondary style={{width: 80}}>
              Edit Mode:
            </TextSecondary>
            <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)}/>
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
            {isEditMode && <IconButton name={icon.delete} onPress={() => deletePlan(plan)}/>}
          </FlexSpaceBetween>
        </CardPressed>
      ))}
      {(isEditMode || !plans?.length) && <AddMoreButton onPress={setNewPlan} header={'Plan'}/>}
    </Page>
  )
})