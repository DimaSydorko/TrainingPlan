import {firebase} from "./index";

export type UserType = firebase.User | null;

export interface UserDataType {
  workoutsUIDs: string[];
  plansUIDs: string[];
  friendsUIDs: string[];
}

export interface ExerciseType {
  name: string;
  breakTimeInSec: number;
  repeats: number;
  currentRepeats?: number[];
  weight: number;
  imgURL?: string;
  laps: number;
  // author: {
  //   uid: string;
  //   name: string;
  // }
}

export interface WorkoutType {
  uid: string;
  name: string;
  labels?: string[];
  exercises: ExerciseType[];
}

export interface PlanType {
  uid: string;
  name: string;
  workoutUIDs: string[];
  labels?: string[];
}