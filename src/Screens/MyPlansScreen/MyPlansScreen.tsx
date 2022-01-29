import React, {useContext, useState} from "react";
import {View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {ScreenName} from "../../Utils/constants";
import {AuthContext, PlansContext} from "../../Providers";
import {CardPressed, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary} from "../../Theme/Parents";
import {AddMoreButton, IconButton, MySwitch} from "../../Common";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";

interface MyPlansScreenType {
  setPlaneName: (name: string) => void;
}

export default React.memo(function MyPlansScreen({setPlaneName}: MyPlansScreenType) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const {plans, addPlan, updatePlan, deletePlan} = useContext(PlansContext)
  const [isEditMode, setIsEditMode] = useState(false)
  const {user} = useContext(AuthContext)

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
  return (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <View/>
        <FlexStart>
          <TextSecondary style={{width: 80}}>
            Edit Mode:
          </TextSecondary>
          <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)}/>
        </FlexStart>
      </FlexSpaceBetween>
      {plans?.map(plan => (
        <CardPressed
          key={plan.uid}
          onPress={() => {
            setPlaneName(plan.name)
            navigation.navigate(ScreenName.Plan)
          }}
        >
          <FlexSpaceBetween>
            <TextHeader color={colors.secondPrimary}>{plan.name}</TextHeader>
            {isEditMode && <IconButton name={'delete-outline'} onPress={() => deletePlan(plan)}/>}
          </FlexSpaceBetween>
          <TextSecondary>{plan.workoutsCount} Workouts</TextSecondary>
        </CardPressed>
      ))}
      {isEditMode && <AddMoreButton onPress={setNewPlan} header={'Plan'}/>}
    </Page>
  )
})