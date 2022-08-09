import { CompositeNavigationProp } from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { StackNavigationProp } from '@react-navigation/stack'

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

export type PublicType = Omit<WorkoutType, 'plansUid'> &
  Omit<PlanType, 'workoutUids'> & {
    workouts?: Omit<WorkoutType, 'plansUid'>[]
    exercises?: ExerciseType[]
    ownerName: string
    likes: string[]
    downloads: string[]
  }

export interface WorkoutType {
  uid: string
  ownerUid: string
  plansUid: string[]
  name: string
  labels: string[]
  exercises: ExerciseType[]
  lastUpdated: number
}

export interface PlanType {
  uid: string
  ownerUid: string
  name: string
  workoutUids: string[]
  labels?: string[]
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

export type TabParamList = {
  App: undefined
  Workout: undefined
  WorkoutInPlan: undefined
  SavedWorkouts: undefined
  Login: undefined
  Registration: undefined
  Plan: undefined
  Profile: undefined
  Settings: undefined
  Publications: undefined
  PublicationWorkout: { workout: (PublicType | WorkoutType) & { ownerName?: string } } | undefined
  PublicationPlan: { publication: PublicType } | undefined
}
export type AppNavigationType = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  StackNavigationProp<TabParamList>
>
