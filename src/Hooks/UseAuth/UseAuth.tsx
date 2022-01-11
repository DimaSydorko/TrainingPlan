import {useCallback, useState} from "react";
import firebase from "../../Utils/firebase";

export default function useAuth() {
  const [user, setUser] = useState<firebase.User | null>(null);

  const signUp = useCallback ((email: string, password: string, fullName: string) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(response => {
        setUser(response.user)
      })
      .catch((error: string) => {
        alert(error)
      });
  },[])

  const signIn = useCallback( (email: string, password: string) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        setUser(response.user)
      })
      .catch(error => {
        alert(error)
      })
  }, [])

  const signOut = useCallback(() => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(null);
      });
  }, []);

  return {
    user,
    signUp,
    signIn,
    signOut
  }
}