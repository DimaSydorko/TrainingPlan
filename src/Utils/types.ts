import {firebase} from "./index";

export type UserType = firebase.User | null;

export interface UserDataType {
  workoutsUIDs: string[];
  plansUIDs: string[];
  friendsUIDs: string[];
}

export interface ApproachType {
  weight: number;
  repeats: number;
}

export interface ExerciseType {
  name: string;
  breakTimeInSec: number;
  repeats: number;
  approaches: ApproachType[];
  imgURL?: string;
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