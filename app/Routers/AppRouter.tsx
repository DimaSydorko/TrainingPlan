import * as React from 'react'
import { ComponentType, useContext, useEffect } from 'react'
import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Icon } from '../Common/Icon/Icon'

import { useAppDispatch, useSettings } from '../Hooks/redux'
import { AppHelperContext } from '../Hooks/AppHelperProvider'
import { workoutAC } from '../store/WorkoutReducer/WorkoutAC'
import { plansAC } from '../store/PlansReducer/PlansAC'
import NotificationHandler from '../Components/NotificationHandler/NotificationHandler'
import WorkoutsRouter from './WorkoutsRouter'
import PlanRouter from './PlanRouter'
import { icon } from '../Theme/icons'
import ProfileRouter from './ProfileRouter'
import PublicationsRouter from './PublicationsRouter'
import { TabName } from '../Utils/constants'
import { AppTabParamList } from '../Utils/types'
import { useAppInsets } from '../Theme/insets'

const Tab = createBottomTabNavigator<AppTabParamList, 'AppTabs'>()

type TabType = {
  name: keyof AppTabParamList
  component: ComponentType<object>
  buttonLabel: string
  testID: string
  icon: (color: string) => React.JSX.Element
}

const tabs = [
  {
    name: TabName.Plans,
    component: PlanRouter,
    buttonLabel: 'My Plans',
    testID: 'tab.plans',
    icon: color => <Icon name={icon.tabPlans} size={28} color={color} />,
  },
  {
    name: TabName.Workouts,
    component: WorkoutsRouter,
    buttonLabel: 'My Workouts',
    testID: 'tab.workouts',
    icon: color => <Icon name={icon.tabWorkouts} size={28} color={color} />,
  },
  {
    name: TabName.Publications,
    component: PublicationsRouter,
    buttonLabel: 'Publications',
    testID: 'tab.publications',
    icon: color => <Icon name={icon.tabPublications} size={28} color={color} />,
  },
  {
    name: TabName.Profile,
    component: ProfileRouter,
    buttonLabel: 'Profile',
    testID: 'tab.profile',
    icon: color => <Icon name={icon.account} size={28} color={color} />,
  },
] as TabType[]

export default function AppRouter() {
  const { isTabMenu } = useContext(AppHelperContext)
  const dispatch = useAppDispatch()
  const { colors, internet } = useSettings()
  const { bottom, footer } = useAppInsets()

  useEffect(() => {
    if (internet.isOnline) {
      dispatch(workoutAC.getWorkouts())
      dispatch(plansAC.getPlans())
      dispatch(workoutAC.getExerciseImages())
    }
  }, [internet.isOnline])

  return (
    <>
      <NotificationHandler />
      <Tab.Navigator id='AppTabs' screenOptions={{ sceneStyle: { backgroundColor: colors.background } }}>
        {tabs.map(({ name, icon, buttonLabel, testID, component }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={focused ? { color: colors.secondPrimary } : { color: colors.black }}>{buttonLabel}</Text>
              ),
              tabBarIcon: ({ focused }) => icon(focused ? colors.secondPrimary : colors.black),
              headerShown: false,
              tabBarButtonTestID: testID,
              tabBarStyle: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                backgroundColor: colors.menu,
                paddingTop: 5,
                // Edge-to-edge: the bar extends under the Android navigation bar / iOS home indicator
                paddingBottom: 5 + bottom,
                height: footer,
                display: isTabMenu ? undefined : 'none',
              },
            }}
          />
        ))}
      </Tab.Navigator>
    </>
  )
}
