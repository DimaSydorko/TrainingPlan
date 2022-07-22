import { Dimensions } from 'react-native'
import { ApproachType, ExerciseType, PlanType, WorkoutType } from './types'

export const FUTURE_FLAG = {
  LABELS: false,
  FRIENDS: false,
  IS_DEV: true,
}

export enum FirebaseDBCollection {
  UsersData = 'usersData',
  Plans = 'plans',
  Workouts = 'workouts',
}

export enum FirebaseDatabase {
  ExerciseImages = '/ExerciseImages',
}

export enum ScreenName {
  Registration = 'Registration',
  Login = 'Login',
  SavedWorkouts = 'Saved Workouts',
  WorkoutInPlan = 'Workout In Plan',
  Workout = 'Workout',
  Plan = 'Plan',
  App = 'App',
}

export const screen = {
  vw: Dimensions.get('window').width,
  vh: Dimensions.get('window').height,
  sw: Dimensions.get('screen').width,
  sh: Dimensions.get('screen').height,
}

export const defaultPlan: PlanType = {
  uid: '',
  ownerUid: '',
  name: 'New_Plan',
  workoutUids: [],
  labels: [],
  lastUpdated: 0,
}
export const defaultWorkout: WorkoutType = {
  uid: '',
  plansUid: [],
  name: 'New_Workout',
  ownerUid: '',
  labels: [],
  exercises: [],
  lastUpdated: 0,
}
export const defaultExercise: ExerciseType = {
  uid: '',
  name: 'New_Exercise',
  laps: 1,
  repeats: 0,
  approaches: [],
  isVisible: true,
  breakTimeInSec: 0,
  color: '#8cd47f',
  imageUrl: '',
}
export const defaultApproach: ApproachType = {
  repeats: 0,
  weight: 0,
}

export const QUERY_LIMIT = 30

export const settings = {
  isVibration: true,
}

export const VIBRATION = {
  TIMER: 50,
  BUTTON: 25,
  END_EXERCISE: [100, 200],
  END_WORKOUT: [100, 400, 200, 100],
}
