import { FilterType } from './types'

export const FUTURE_FLAG = {
  IS_DEV: true
}

export enum FirebaseDatabase {
  ExerciseImages = '/ExerciseImages'
}

export enum FirebaseStorage {
  Exercises = 'exercises'
}

export enum FirebaseDBCollection {
  UsersData = 'usersData',
  Plans = 'plans',
  Workouts = 'workouts'
}

export const filters: FilterType[] = ['home', 'gym', 'street']
