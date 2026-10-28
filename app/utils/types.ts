import type { NavigatorScreenParams, ParamListBase } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ScreenName, TabName } from './constants'

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

/** Root stack (AuthRouter): auth screens when logged out, the tab app when logged in. */
export type AuthStackParamList = {
  [ScreenName.Login]: undefined
  [ScreenName.Registration]: undefined
  [ScreenName.App]: NavigatorScreenParams<AppTabParamList> | undefined
}

/** Bottom tabs (AppRouter). */
export type AppTabParamList = {
  [TabName.Plans]: NavigatorScreenParams<PlansStackParamList> | undefined
  [TabName.Workouts]: NavigatorScreenParams<WorkoutsStackParamList> | undefined
  [TabName.Profile]: NavigatorScreenParams<ProfileStackParamList> | undefined
}

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
  [ScreenName.Settings]: undefined
}

export type AuthNavigation = StackNavigationProp<AuthStackParamList>
export type PlansNavigation = StackNavigationProp<PlansStackParamList>
export type WorkoutsNavigation = StackNavigationProp<WorkoutsStackParamList>
export type PlayableNavigation = StackNavigationProp<PlayableStackParamList>
export type ProfileNavigation = StackNavigationProp<ProfileStackParamList>

/**
 * Navigation prop for screens that only need stack actions common to every stack
 * (goBack, setOptions, addListener). Kept for PlayingScreen / usePlaying, which only call goBack().
 * New code should use one of the navigator-specific types above.
 */
export type AppNavigationType = StackNavigationProp<ParamListBase>
