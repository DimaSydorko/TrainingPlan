import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { MyPlansScreen, PlayingScreen, WorkoutScreen, WorkoutsScreen } from '@screens'
import { useScreenOptions } from '@theme/navigation-theme'
import { ScreenName } from '@utils/constants'
import { PlansStackParamList } from '@utils/types'

const Stack = createStackNavigator<PlansStackParamList, 'PlansStack'>()

function PlanWorkoutsScreen() {
  return <WorkoutsScreen isInPlan />
}

export default memo(function PlanRouter() {
  const options = useScreenOptions()

  return (
    <>
      <Stack.Navigator id='PlansStack'>
        <Stack.Screen
          name={ScreenName.SavedWorkouts}
          options={{ ...options, title: 'All saved Plans' }}
          component={MyPlansScreen}
        />
        <Stack.Screen name={ScreenName.Plan} options={options} component={PlanWorkoutsScreen} />
        <Stack.Screen name={ScreenName.WorkoutInPlan} options={options} component={WorkoutScreen} />
        <Stack.Screen
          name={ScreenName.Playing}
          options={{ ...options, headerShown: false }}
          component={PlayingScreen}
        />
      </Stack.Navigator>
    </>
  )
})
