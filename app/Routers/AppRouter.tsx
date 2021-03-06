import * as React from 'react'
import { useContext, useEffect } from 'react'
import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAppDispatch, useSettings, useUser } from '../Hooks/redux'
import { AppHelperContext } from '../Hooks/AppHelperProvider'
import { workoutActionCreators } from '../store/WorkoutReducer/WorkoutActionCreators'
import { plansActionCreators } from '../store/PlansReducer/PlansActionCreators'
import NotificationHandler from '../Components/NotificationHandler/NotificationHandler'
import WorkoutsRouter from './WorkoutsRouter'
import PlanRouter from './PlanRouter'
import { EmptyScreen, PlayingScreen } from '../Screens'
import { PlayTimerProvider } from '../Screens/PlayingScreen/components/PlayTimerProvider'

type TabType = {
  name: string
  component: () => JSX.Element
  buttonLabel: string
  icon: (color: string) => JSX.Element
}

const tabs = [
  {
    name: 'All saved Plans',
    component: PlanRouter,
    buttonLabel: 'My Plans',
    icon: color => {
      return <Icon name='clipboard-list-outline' size={28} color={color} />
    },
  },
  {
    name: 'All saved Workouts',
    component: WorkoutsRouter,
    buttonLabel: 'My Workouts',
    icon: color => {
      return <Icon name='clock-fast' size={28} color={color} />
    },
  },
  {
    name: 'My Suggestion',
    component: EmptyScreen,
    buttonLabel: 'Suggestion',
    icon: color => {
      return <Icon name='tooltip-text-outline' size={28} color={color} />
    },
  },
  {
    name: 'More',
    component: EmptyScreen,
    buttonLabel: 'More',
    icon: color => {
      return <Icon name='dots-horizontal' size={28} color={color} />
    },
  },
] as TabType[]

export default function AppRouter() {
  const Tab = createBottomTabNavigator()
  const { isPlaying, isTabMenu } = useContext(AppHelperContext)
  const dispatch = useAppDispatch()
  const { colors, internet } = useSettings()
  const { user } = useUser()

  useEffect(() => {
    if (internet.isOnline) {
      dispatch(workoutActionCreators.getWorkouts({ uid: user.uid, findBy: 'ownerUid' }))
      dispatch(plansActionCreators.getPlans(user.uid))
      dispatch(workoutActionCreators.getExerciseImages())
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
                backgroundColor: colors.menu,
                paddingTop: 5,
                paddingBottom: 5,
                height: 55,
                display: isTabMenu ? undefined : 'none',
              },
            }}
          />
        ))}
      </Tab.Navigator>
    </>
  )
}
