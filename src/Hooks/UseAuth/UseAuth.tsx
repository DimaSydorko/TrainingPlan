import {useCallback, useEffect, useState} from "react";
import firebase from "../../Utils/firebase";
import {asyncStorage} from "../../Utils/asyncStarage";
import {AsyncStorageKey} from "../../Utils/constants";

export default function useAuth() {
  const [user, setUser] = useState<firebase.User | null>(null);

  const getUserFromStorage = useCallback(async () => {
    const storageUser = await asyncStorage.get(AsyncStorageKey.user)
    setUser(storageUser as unknown as firebase.User)
  }, [])

  useEffect(() => {
    if (user) return

    getUserFromStorage().then(() => {
      return
    })
  }, [])

  const signUp = useCallback((email: string, password: string, displayName: string) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        if (response.user) {
          response.user.updateProfile({displayName})
            .then(() => {
              asyncStorage.set(AsyncStorageKey.user, response.user)
                .then(() => {
                  setUser(response.user)
                })
            })
        }
      })
      .catch((error: string) => {
        alert(error)
      });
    firebase.auth().updateCurrentUser(user).then()
  }, [])

  const signIn = useCallback((email: string, password: string) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        asyncStorage.set(AsyncStorageKey.user, response.user)
          .then(() => setUser(response.user))
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
        asyncStorage.set(AsyncStorageKey.user, null)
          .then(() => setUser(null))
      });
  }, []);

  return {
    user,
    signUp,
    signIn,
    signOut
  }
}