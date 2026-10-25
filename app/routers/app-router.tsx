import * as React from 'react'
import { ComponentType, useContext, useEffect } from 'react'
import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Icon } from '@common/icon/icon'

import { useAppDispatch } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { AppHelperContext } from '@hooks/app-helper-provider'
import { workoutAC } from '@store/workout-reducer/workout-ac'
import { plansAC } from '@store/plans-reducer/plans-ac'
import NotificationHandler from '@components/notification-handler/notification-handler'
import WorkoutsRouter from './workouts-router'
import PlanRouter from './plan-router'
import { icon } from '@theme/icons'
import ProfileRouter from './profile-router'
import PublicationsRouter from './publications-router'
import { TabName } from '@utils/constants'
import { AppTabParamList } from '@utils/types'
import { useAppInsets } from '@theme/insets'
import { TAB_BAR_VERTICAL_PADDING } from './app-router.constants'
import styles from './app-router.styles'

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
  const { colors } = useAppTheme()
  const isOnline = useIsOnline()
  const { bottom, footer } = useAppInsets()

  useEffect(() => {
    if (isOnline) {
      dispatch(workoutAC.getWorkouts())
      dispatch(plansAC.getPlans())
      dispatch(workoutAC.getExerciseImages())
    }
  }, [isOnline])

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
                <Text style={focused ? { color: colors.accent } : { color: colors.inverse }}>{buttonLabel}</Text>
              ),
              tabBarIcon: ({ focused }) => icon(focused ? colors.accent : colors.inverse),
              headerShown: false,
              tabBarButtonTestID: testID,
              tabBarStyle: [
                styles.tabBar,
                {
                  backgroundColor: colors.surfaceElevated,
                  paddingBottom: TAB_BAR_VERTICAL_PADDING + bottom,
                  height: footer,
                  display: isTabMenu ? undefined : 'none',
                },
              ],
            }}
          />
        ))}
      </Tab.Navigator>
    </>
  )
}
