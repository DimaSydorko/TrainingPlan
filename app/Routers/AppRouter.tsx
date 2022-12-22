import * as React from 'react'
import { NamedExoticComponent, useContext, useEffect } from 'react'
import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useAppDispatch, useSettings } from '../Hooks/redux'
import { AppHelperContext } from '../Hooks/AppHelperProvider'
import { workoutAC } from '../store/WorkoutReducer/WorkoutAC'
import { plansAC } from '../store/PlansReducer/PlansAC'
import NotificationHandler from '../Components/NotificationHandler/NotificationHandler'
import WorkoutsRouter from './WorkoutsRouter'
import PlanRouter from './PlanRouter'
import { PlayingScreen } from '../Screens'
import { PlayTimerProvider } from '../Screens/PlayingScreen/components/PlayTimerProvider'
import { icon } from '../Theme/icons'
import ProfileRouter from './ProfileRouter'
import PublicationsRouter from './PublicationsRouter'
import { appScreen } from '../Utils/constants'

type TabType = {
  name: string
  component: NamedExoticComponent<object>
  buttonLabel: string
  icon: (color: string) => JSX.Element
}

const tabs = [
  {
    name: 'All saved Plans',
    component: PlanRouter,
    buttonLabel: 'My Plans',
    icon: color => <Icon name='clipboard-list-outline' size={28} color={color} />,
  },
  {
    name: 'All saved Workouts',
    component: WorkoutsRouter,
    buttonLabel: 'My Workouts',
    icon: color => <Icon name='clock-fast' size={28} color={color} />,
  },
  {
    name: 'Publications',
    component: PublicationsRouter,
    buttonLabel: 'Publications',
    icon: color => <Icon name='tooltip-text-outline' size={28} color={color} />,
  },
  {
    name: 'Profile',
    component: ProfileRouter,
    buttonLabel: 'Profile',
    icon: color => <Icon name={icon.account} size={28} color={color} />,
  },
] as TabType[]

export default function AppRouter() {
  const Tab = createBottomTabNavigator()
  const { isPlaying, isTabMenu } = useContext(AppHelperContext)
  const dispatch = useAppDispatch()
  const { colors, internet } = useSettings()

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
      {isPlaying && (
        <PlayTimerProvider>
          <PlayingScreen />
        </PlayTimerProvider>
      )}
      <Tab.Navigator
        sceneContainerStyle={{
          backgroundColor: colors.background,
        }}
      >
        {tabs.map(({ name, icon, buttonLabel, component }) => (
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
              tabBarStyle: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                backgroundColor: colors.menu,
                paddingTop: 5,
                paddingBottom: 5,
                height: appScreen.footer,
                display: isTabMenu ? undefined : 'none',
              },
            }}
          />
        ))}
      </Tab.Navigator>
    </>
  )
}
