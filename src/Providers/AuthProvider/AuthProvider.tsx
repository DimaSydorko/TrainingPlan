import {createContext} from "react";
import firebase from "../../Utils/firebase";
import {ProviderProps} from "../index";
import useAuth from "../../Hooks/UseAuth/UseAuth";

interface AuthContextType {
  user: firebase.User | null;
  signUp: (email: string, password: string, fullName: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export default function AuthProvider({children}: ProviderProps) {
  const {
    user,
    signUp,
    signIn,
    signOut,
  } = useAuth()

  return (
    <AuthContext.Provider value={{
      user,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}