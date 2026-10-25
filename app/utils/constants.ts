import { ApproachType, ExerciseType, PlanType, WorkoutType } from './types'

export const FUTURE_FLAG = {
  IS_DEV: false,
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
  SavedWorkouts = 'SavedWorkouts',
  WorkoutInPlan = 'WorkoutInPlan',
  Workout = 'Workout',
  Plan = 'Plan',
  App = 'App',
  Profile = 'Profile',
  Settings = 'Settings',
  Playing = 'Playing',
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

export enum SoundType {
  Bell = 'bell.mp3',
  DigitalClock = 'digital_clock.mp3',
  DoubleDing = 'double_ding.mp3',
  HopBell = 'hop_bell.mp3',
}

// Delay between a cue sound and the following speech. The old code used
// playSound.getDuration(). Now a fallback for SoundPlayer.durationMs while the sound is not loaded.
export const SOUND_CUE_DURATION_MS = 1000

// Bottom tab route names (AppRouter). The values are the old tab names, kept unchanged.
export enum TabName {
  Plans = 'All saved Plans',
  Workouts = 'All saved Workouts',
  Profile = 'Profile',
}
