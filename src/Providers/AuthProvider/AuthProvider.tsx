import {createContext} from "react";
import {ProviderProps} from "../index";
import useAuth from "../../Hooks/UseAuth/UseAuth";
import {UserDataType, UserType} from "../../Utils/types";

interface AuthContextType {
  user: UserType | null;
  signUp: (email: string, password: string, fullName: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userData: UserDataType | null;
  userDataUpdate: (userUId: string, userData: UserDataType) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export default function AuthProvider({children}: ProviderProps) {
  const {
    user,
    signUp,
    signIn,
    signOut,
    userData,
    userDataUpdate,
  } = useAuth()

  return (
    <AuthContext.Provider value={{
      user,
      signUp,
      signIn,
      signOut,
      userData,
      userDataUpdate,
    }}>
      {children}
    </AuthContext.Provider>
  )
}