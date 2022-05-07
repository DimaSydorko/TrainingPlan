export interface UserType {
  uid: string
  displayName: string
  photoURL: string | null
}

export interface UserDataType {
  friendsUIDs: string[]
}

export interface StoredFile {
  fileName: string
  storageKey: string
  downloadUrl: string
}

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
  // imgURL?: StoredFile | null
}

export type SelectedWorkoutType = Omit<WorkoutType, 'exercises'> & {
  isPlaying: boolean
  exercises: SelectedExerciseType[]
}
export type SelectedExerciseType = Omit<ExerciseType, 'approaches'> & { approaches: SelectedApproachType[] }

export interface WorkoutType {
  uid: string
  ownerUid: string
  plansUid: string[]
  name: string
  labels: string[]
  exercises: ExerciseType[]
}

export interface PlanType {
  uid: string
  ownerUid: string
  name: string
  workoutUids: string[]
  labels?: string[]
}

export interface ColorsType {
  primary: string
  second: string
  secondPrimary: string

  error: string
  disabled: string

  black: string
  white: string

  background: string
  text: string
  textSecondary: string
  menu: string
}
