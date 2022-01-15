import {Dimensions} from "react-native";

export enum FirebaseDBCollection {

}

export enum ScreenName {
  Registration = 'Registration',
  Login = 'Login',
  Home = 'Home'
}

export enum AsyncStorageKey {
  user = 'user',
}

export const screen = {
  vw: Dimensions.get('window').width,
  vh: Dimensions.get('window').height
}
