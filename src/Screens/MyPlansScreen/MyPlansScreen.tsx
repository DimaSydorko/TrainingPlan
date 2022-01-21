import React, {useContext} from "react";
import {useNavigation} from "@react-navigation/native";
import {ScreenName} from "../../Utils/constants";
import {PlansContext} from "../../Providers/PlansProvider/PlansProvider";
import {CardPressed, Page, TextHeader, TextSecondary} from "../../Common/Parents/Parents";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";

interface MyPlansScreenType {
  setPlaneName: (name: string) => void;
}

export default function MyPlansScreen({setPlaneName}: MyPlansScreenType) {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const {plans} = useContext(PlansContext)

  return (
    <Page style={theme.margin.top20}>
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
    </Page>
  )
}