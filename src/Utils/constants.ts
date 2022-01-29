import {Dimensions} from "react-native";

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
  Workout = 'Workout',
  Plan = 'Plan',
  Home = 'Home',
  App = 'App',
}

export enum AsyncStorageKey {
  User = 'User',
  Plans = 'Plans',
}

export const screen = {
  vw: Dimensions.get('window').width,
  vh: Dimensions.get('window').height
}

export const QUERY_LIMIT = 30