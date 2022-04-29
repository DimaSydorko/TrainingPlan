import { Dimensions } from 'react-native'
import { ApproachType, ExerciseType } from './types'

export const FUTURE_FLAG = {
  LABELS: false,
}

export enum FirebaseDBCollection {
  UsersData = 'usersData',
  Plans = 'plans',
  Workouts = 'workouts',
}

export enum ScreenName {
  Registration = 'Registration',
  Login = 'Login',
  SavedPlans = 'Saved Plans',
  SavedWorkouts = 'Saved Workouts',
  WorkoutInPlan = 'Workout In Plan',
  Workout = 'Workout',
  Plan = 'Plan',
  Home = 'Home',
  App = 'App',
}

export enum AsyncStorageKey {
  User = 'User',
  Plans = 'Plans',
  Workouts = 'workouts',
}

export const screen = {
  vw: Dimensions.get('window').width,
  vh: Dimensions.get('window').height,
}

export const defaultExercise: ExerciseType = {
  uid: '',
  name: 'New exercise',
  laps: 0,
  repeats: 0,
  approaches: [],
  isVisible: true,
  breakTimeInSec: 0,
  imgURL: '',
}
export const defaultApproach: ApproachType = {
  repeats: 0,
  weight: 0,
}

export const QUERY_LIMIT = 30
