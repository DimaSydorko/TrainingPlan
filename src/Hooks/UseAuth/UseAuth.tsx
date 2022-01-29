import {useCallback, useEffect, useState} from "react";
import firebase from "../../Utils/firebase";
import {asyncStorage} from "../../Utils/asyncStarage";
import {AsyncStorageKey, FirebaseDBCollection} from "../../Utils/constants";
import {UserDataType, UserType} from "../../Utils/types";

export default function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  let userLocal: UserType | null = null;

  const getUserFromStorage = useCallback(async () => {
    const storageUser = await asyncStorage.get(AsyncStorageKey.User)
    if (storageUser) {
      userLocal = storageUser
      await userDataRequest(storageUser.uid);
    }
  }, [])

  useEffect(() => {
    if (!user) {
      getUserFromStorage()
        .then(() => {
          return;
        });
    }
  }, [])

  const userDataRequest = useCallback(async (userUid: string) => {
    firebase
      .firestore()
      .collection(FirebaseDBCollection.UsersData)
      .doc(userUid)
      .get()
      .then(doc => {
        if (doc.exists && userLocal) {
          const userData = doc.data() as UserDataType
          setUser({...userLocal, data: userData})
        }
        if (isLoading) {
          setIsLoading(false);
        }
      })
      .catch((error: string) => {
        console.error(error)
        if (isLoading) {
          setIsLoading(false);
        }
      });
  }, [])

  const userDataUpdate = useCallback(async (userUid: string, userData: UserDataType) => {
    firebase
      .firestore()
      .collection(FirebaseDBCollection.UsersData)
      .doc(userUid)
      .set(userData)
      .then(() => {
        if (user) {
          setUser({...user, data: userData});
        }
      })
      .catch((error: string) => {
        console.error(error);
      });
  }, [])

  const signUp = useCallback((email: string, password: string, displayName: string) => {
    const emptyUserData = {
      friendsUIDs: [],
    } as UserDataType

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async response => {
        await firebase
          .auth()
          .updateCurrentUser(response.user)
          .catch(err => {
            console.error(err)
          })
        if (response.user) {
          const responseUser: firebase.User = response.user
          responseUser.updateProfile({displayName})
            .then(() => {
              userDataUpdate(response.user?.uid || '', emptyUserData)
              asyncStorage
                .set(AsyncStorageKey.User, responseUser)
                .then(() => {
                  setUser({...responseUser, data: null})
                })
            })
        }
      })
      .catch((error: string) => {
        console.error(error)
      });
  }, [])

  const signIn = useCallback((email: string, password: string) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (response) => {
        userLocal = response.user as UserType
        await userDataRequest(response.user?.uid || '')
        await asyncStorage.set(AsyncStorageKey.User, response.user)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const signOut = useCallback(() => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        asyncStorage
          .set(AsyncStorageKey.User, null)
          .then(() => {
            setUser(null);
          })
      });
  }, []);

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    userDataUpdate,
  }
}