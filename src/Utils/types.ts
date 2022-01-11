import {firebase} from "./index";

export type UserDataType = {
  uid: string;
  email: string;
  name: string;
}

export type UserType = firebase.User | null;
