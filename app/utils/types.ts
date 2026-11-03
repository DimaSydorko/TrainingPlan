import type { CompositeNavigationProp, NavigatorScreenParams, ParamListBase } from '@react-navigation/native'
import type { DrawerNavigationProp } from '@react-navigation/drawer'
import type { StackNavigationProp } from '@react-navigation/stack'
import { DRAWER_ROUTE, ScreenName } from './constants'

export type UserType = {
  uid: string
  displayName: string
  photoURL: string | null
  email: string
}

export type UserDataType = {
  friendsUIDs: string[]
}

export type StoredFile = {
  fileName: string
  storageKey: string
  downloadUrl: string
}

export type ExerciseImageFilterType = 'home' | 'gym' | 'street'
export type StoredExerciseImage = StoredFile & { filter: ExerciseImageFilterType }

export type ApproachType = {
  weight: number
  repeats: number
}

export type SelectedApproachType = ApproachType & {
  currentRepeats?: number
  currentWeight?: number
}

export type ExerciseType = {
  uid: string
  name: string
  breakTimeInSec: number
  laps: number
  repeats: number
  approaches: ApproachType[]
  isVisible: boolean
  colorIdx: number
  imageUrl: string
}

export type SelectedWorkoutType = Omit<WorkoutType, 'exercises'> & {
  exercises: SelectedExerciseType[]
}
export type SelectedExerciseType = Omit<ExerciseType, 'approaches'> & { approaches: SelectedApproachType[] }

export type WorkoutType = {
  uid: string
  colorIdx: number
  name: string
  labels: string[]
  exercises: ExerciseType[]
  ownerUid?: string
  lastUpdated?: number
}

export type PlanType = {
  uid: string
  colorIdx: number
  ownerUid: string
  name: string
  workouts: WorkoutType[]
  labels: string[]
  lastUpdated: number
}

export type SetStateType<S> = (arg: S | ((prevState: S) => S)) => void

// ---------------------------------------------------------------------------
// Navigation (React Navigation 7). One param list per navigator, so `tsc` catches
// navigate() calls to screens that are not in the current stack.
// ---------------------------------------------------------------------------

/** Root stack (AuthRouter): auth screens when logged out, the drawer app when logged in. */
export type AuthStackParamList = {
  [ScreenName.Login]: undefined
  [ScreenName.Registration]: undefined
  [ScreenName.App]: NavigatorScreenParams<AppDrawerParamList> | undefined
}

/** Sidebar drawer (AppRouter). */
export type AppDrawerParamList = {
  [DRAWER_ROUTE.Home]: NavigatorScreenParams<HomeStackParamList> | undefined
  [DRAWER_ROUTE.Plans]: NavigatorScreenParams<PlansStackParamList> | undefined
  [DRAWER_ROUTE.Workouts]: NavigatorScreenParams<WorkoutsStackParamList> | undefined
  [DRAWER_ROUTE.Settings]: NavigatorScreenParams<SettingsStackParamList> | undefined
  [DRAWER_ROUTE.Profile]: NavigatorScreenParams<ProfileStackParamList> | undefined
}

export type DrawerRouteName = keyof AppDrawerParamList

/** Stack screens that can start a workout (both the Plans and the Workouts stacks have it). */
export type PlayableStackParamList = {
  [ScreenName.Playing]: undefined
}

export type PlansStackParamList = PlayableStackParamList & {
  [ScreenName.SavedWorkouts]: undefined
  [ScreenName.Plan]: undefined
  [ScreenName.WorkoutInPlan]: undefined
}

export type WorkoutsStackParamList = PlayableStackParamList & {
  [ScreenName.SavedWorkouts]: undefined
  [ScreenName.Workout]: undefined
}

export type ProfileStackParamList = {
  [ScreenName.Profile]: undefined
}

export type SettingsStackParamList = {
  [ScreenName.Settings]: undefined
}

export type HomeStackParamList = PlayableStackParamList & {
  [ScreenName.Home]: undefined
  [ScreenName.Workout]: undefined
}

export type AuthNavigation = StackNavigationProp<AuthStackParamList>
export type PlansNavigation = StackNavigationProp<PlansStackParamList>
export type WorkoutsNavigation = StackNavigationProp<WorkoutsStackParamList>
export type PlayableNavigation = StackNavigationProp<PlayableStackParamList>
export type ProfileNavigation = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList>,
  DrawerNavigationProp<AppDrawerParamList>
>
export type HomeNavigation = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList>,
  DrawerNavigationProp<AppDrawerParamList>
>

/**
 * Navigation prop for screens that only need stack actions common to every stack
 * (goBack, setOptions, addListener). Kept for PlayingScreen / usePlaying, which only call goBack().
 * New code should use one of the navigator-specific types above.
 */
export type AppNavigationType = StackNavigationProp<ParamListBase>
