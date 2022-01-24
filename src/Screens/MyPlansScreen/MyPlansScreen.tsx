import React, {useContext, useState} from "react";
import {View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {ScreenName} from "../../Utils/constants";
import {PlansContext} from "../../Providers/PlansProvider/PlansProvider";
import {CardPressed, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary} from "../../Theme/Parents";
import {AddMoreButton, MySwitch} from "../../Common";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider";

interface MyPlansScreenType {
  setPlaneName: (name: string) => void;
}

export default function MyPlansScreen({setPlaneName}: MyPlansScreenType) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const {plans} = useContext(PlansContext)
  const [isEditMode, setIsEditMode] = useState(false)
  const {user, userData, userDataUpdate} = useContext(AuthContext)

  console.log('user', user)
  console.log('userData', userData)

  const setUserData = async () => {
  await userDataUpdate(user?.uid || '', {
    plansUIDs: [],
    friendsUIDs: ['1', '2', '3'],
    workoutsUIDs: [],
  })
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
          <TextHeader color={colors.secondPrimary}>{plan.name}</TextHeader>
          <TextSecondary>{plan.workoutUIDs.length} Workouts</TextSecondary>
        </CardPressed>
      ))}
      {isEditMode && <AddMoreButton onPress={setUserData} header={'Plan'}/>}
    </Page>
  )
}