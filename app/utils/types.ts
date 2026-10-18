import type { NavigatorScreenParams, ParamListBase } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ScreenName, TabName } from './constants'

export interface UserType {
  uid: string
  displayName: string
  photoURL: string | null
  email: string
}

export interface UserDataType {
  friendsUIDs: string[]
}

export interface StoredFile {
  fileName: string
  storageKey: string
  downloadUrl: string
}

export type ExerciseImageFilterType = 'home' | 'gym' | 'street'
export type StoredExerciseImage = StoredFile & { filter: ExerciseImageFilterType }

export interface ApproachType {
  weight: number
  repeats: number
}

export type SelectedApproachType = ApproachType & {
  currentRepeats?: number
  currentWeight?: number
}

export interface ExerciseType {
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

export type PublicType = Omit<WorkoutType, 'exercises'> &
  Omit<PlanType, 'workouts'> & {
    workouts?: WorkoutType[]
    exercises?: ExerciseType[]
    ownerName: string
    likes: string[]
    downloads: string[]
  }

export interface WorkoutType {
  uid: string
  colorIdx: number
  name: string
  labels: string[]
  exercises: ExerciseType[]
  ownerUid?: string
  lastUpdated?: number
}

export interface PlanType {
  uid: string
  colorIdx: number
  ownerUid: string
  name: string
  workouts: WorkoutType[]
  labels: string[]
  lastUpdated: number
}

export interface ColorsType {
  primary: string
  secondPrimary: string

  error: string
  info: string
  disabled: string

  black: string
  white: string

  background: string
  text: string
  textSecondary: string
  menu: string
}

export type SetStateType<S> = (arg: S | ((prevState: S) => S)) => void

// ---------------------------------------------------------------------------
// Navigation (React Navigation 7). One param list per navigator, so `tsc` catches
// navigate() calls to screens that are not in the current stack.
// ---------------------------------------------------------------------------

export type PublicationWorkoutParams = { workout: (PublicType | WorkoutType) & { ownerName?: string } }
export type PublicationPlanParams = { publication: PublicType }

/** Screens that open a publication. Both the Publications and the Profile stacks register them. */
export type PublicationScreensParamList = {
  [ScreenName.PublicationWorkout]: PublicationWorkoutParams
  [ScreenName.PublicationPlan]: PublicationPlanParams
}

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
  [TabName.Publications]: NavigatorScreenParams<PublicationsStackParamList> | undefined
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

export type PublicationsStackParamList = PublicationScreensParamList & {
  [ScreenName.Publications]: undefined
}

export type ProfileStackParamList = PublicationScreensParamList & {
  [ScreenName.Profile]: undefined
  [ScreenName.Settings]: undefined
}

export type AuthNavigation = StackNavigationProp<AuthStackParamList>
export type PlansNavigation = StackNavigationProp<PlansStackParamList>
export type WorkoutsNavigation = StackNavigationProp<WorkoutsStackParamList>
export type PlayableNavigation = StackNavigationProp<PlayableStackParamList>
export type PublicationsNavigation = StackNavigationProp<PublicationScreensParamList>
export type ProfileNavigation = StackNavigationProp<ProfileStackParamList>

/**
 * Navigation prop for screens that only need stack actions common to every stack
 * (goBack, setOptions, addListener). Kept for A4's PlayingScreen / usePlaying, which only call goBack().
 * New code should use one of the navigator-specific types above.
 */
export type AppNavigationType = StackNavigationProp<ParamListBase>
