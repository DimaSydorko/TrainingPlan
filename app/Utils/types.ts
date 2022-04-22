export interface UserType {
  uid: string
  displayName: string
  photoURL: string | null
}

export interface UserDataType {
  friendsUIDs: string[];
}

export interface ApproachType {
  weight: number;
  repeats: number;
}

export interface ExerciseType {
  uid: string;
  name: string;
  breakTimeInSec: number;
  laps: number;
  repeats: number;
  approaches: ApproachType[];
  isVisible: boolean;
  imgURL: string;
}

export interface WorkoutType {
  uid: string;
  ownerUid: string;
  plansUid: string[];
  name: string;
  labels: string[];
  exercises: ExerciseType[];
}

export interface PlanType {
  uid: string;
  ownerUid: string;
  name: string;
  workoutsCount: number;
  labels?: string[];
}