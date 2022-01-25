import {createContext} from "react";
import {ProviderProps} from "../index";
import useAuth from "../../Hooks/UseAuth/UseAuth";
import {UserDataType, UserType} from "../../Utils/types";

interface AuthContextType {
  user: UserType | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userDataUpdate: (userUId: string, userData: UserDataType) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export default function AuthProvider({children}: ProviderProps) {
  const {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    userDataUpdate,
  } = useAuth()

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signUp,
      signIn,
      signOut,
      userDataUpdate,
    }}>
      {children}
    </AuthContext.Provider>
  )
}