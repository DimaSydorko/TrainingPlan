import * as React from 'react'
import { ComponentType, useEffect } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { getFocusedRouteNameFromRoute, RouteProp } from '@react-navigation/native'
import { Icon, IconName } from '@common/icon/icon'

import { useAppDispatch } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { workoutAC } from '@store/workout-reducer/workout-ac'
import { plansAC } from '@store/plans-reducer/plans-ac'
import NotificationHandler from '@components/notification-handler/notification-handler'
import { icon } from '@theme/icons'
import { DRAWER_ROUTE, ScreenName } from '@utils/constants'
import { AppDrawerParamList, DrawerRouteName } from '@utils/types'
import HomeRouter from './home-router'
import WorkoutsRouter from './workouts-router'
import PlanRouter from './plan-router'
import SettingsRouter from './settings-router'
import ProfileRouter from './profile-router'
import AiBarScreenLayout from './ai-bar-screen-layout'
import { DRAWER_ICON_SIZE } from './app-router.constants'

const Drawer = createDrawerNavigator<AppDrawerParamList, 'AppDrawer'>()

type DrawerItemConfig = {
  name: DrawerRouteName
  component: ComponentType<object>
  rootScreen: ScreenName
  label: string
  testID: string
  iconName: IconName
}

const drawerItems: DrawerItemConfig[] = [
  {
    name: DRAWER_ROUTE.Home,
    component: HomeRouter,
    rootScreen: ScreenName.Home,
    label: 'Home',
    testID: 'drawer.home',
    iconName: icon.tabHome,
  },
  {
    name: DRAWER_ROUTE.Plans,
    component: PlanRouter,
    rootScreen: ScreenName.SavedWorkouts,
    label: 'My Plans',
    testID: 'drawer.plans',
    iconName: icon.tabPlans,
  },
  {
    name: DRAWER_ROUTE.Workouts,
    component: WorkoutsRouter,
    rootScreen: ScreenName.SavedWorkouts,
    label: 'My Workouts',
    testID: 'drawer.workouts',
    iconName: icon.tabWorkouts,
  },
  {
    name: DRAWER_ROUTE.Settings,
    component: SettingsRouter,
    rootScreen: ScreenName.Settings,
    label: 'Settings',
    testID: 'drawer.settings',
    iconName: icon.settings,
  },
  {
    name: DRAWER_ROUTE.Profile,
    component: ProfileRouter,
    rootScreen: ScreenName.Profile,
    label: 'Profile',
    testID: 'drawer.profile',
    iconName: icon.account,
  },
]

export default function AppRouter() {
  const dispatch = useAppDispatch()
  const { colors } = useAppTheme()
  const isOnline = useIsOnline()

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
      <Drawer.Navigator
        id='AppDrawer'
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
          drawerStyle: { backgroundColor: colors.surfaceElevated },
          drawerActiveTintColor: colors.accent,
          drawerInactiveTintColor: colors.inverse,
        }}
      >
        {drawerItems.map(({ name, component, rootScreen, label, testID, iconName }) => (
          <Drawer.Screen
            key={name}
            name={name}
            component={component}
            layout={({ route, children }) => (
              <AiBarScreenLayout isAiBarVisible={isRootScreenFocused(route, rootScreen)}>{children}</AiBarScreenLayout>
            )}
            options={({ route }) => ({
              drawerLabel: label,
              drawerItemTestID: testID,
              drawerIcon: ({ color }) => <Icon name={iconName} size={DRAWER_ICON_SIZE} color={color} />,
              swipeEnabled: isRootScreenFocused(route, rootScreen),
            })}
          />
        ))}
      </Drawer.Navigator>
    </>
  )
}

function isRootScreenFocused(route: RouteProp<AppDrawerParamList>, rootScreen: ScreenName) {
  return (getFocusedRouteNameFromRoute(route) ?? rootScreen) === rootScreen
}
