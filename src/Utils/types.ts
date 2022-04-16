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
  name: string;
  breakTimeInSec: number;
  repeats: number;
  approaches: ApproachType[];
  isVisible: boolean;
  imgURL?: string;
}

export interface WorkoutType {
  uid: string;
  ownerUid: string;
  plansUid: string[];
  name: string;
  labels: string[];
  exercises: ExerciseType[];
}

// export type WorkoutPlanType = Required<Pick<WorkoutType, 'plansUid'>> & Omit<WorkoutType, 'plansUid'>

export interface PlanType {
  uid: string;
  ownerUid: string;
  name: string;
  workoutsCount: number;
  labels?: string[];
}