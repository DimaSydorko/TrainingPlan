import { Dimensions } from 'react-native'
import { ApproachType, ExerciseType, PlanType, WorkoutType } from './types'

export const FUTURE_FLAG = {
  LABELS: false,
  FRIENDS: false,
  IS_DEV: false,
}

export enum FirebaseDBCollection {
  UsersData = 'usersData',
  Plans = 'plans',
  Workouts = 'workouts',
  Publications = 'publications',
}

export enum FirebaseDatabase {
  ExerciseImages = '/ExerciseImages',
}

export enum ScreenName {
  Registration = 'Registration',
  Login = 'Login',
  SavedWorkouts = 'SavedWorkouts',
  WorkoutInPlan = 'WorkoutInPlan',
  Workout = 'Workout',
  Plan = 'Plan',
  App = 'App',
  Publications = 'Publications',
  PublicationWorkout = 'PublicationWorkout',
  PublicationPlan = 'PublicationPlan',
  Profile = 'Profile',
  Settings = 'Settings',
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
  workouts: [],
  labels: [],
  colorIdx: 3,
  lastUpdated: 0,
}
export const defaultWorkout: WorkoutType = {
  uid: '',
  colorIdx: 3,
  name: 'New_Workout',
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
  colorIdx: 0,
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
