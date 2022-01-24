import {useCallback, useEffect, useState} from "react";
import firebase from "../../Utils/firebase";
import {asyncStorage} from "../../Utils/asyncStarage";
import {AsyncStorageKey, FirebaseDBCollection} from "../../Utils/constants";
import {UserDataType, UserType} from "../../Utils/types";

export default function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [userData, setUserData] = useState<UserDataType | null>(null);

  const getUserFromStorage = useCallback(async () => {
    const storageUser = await asyncStorage.get(AsyncStorageKey.User)
    if (storageUser.uid) {
      setUser(storageUser);
      await userDataRequest(storageUser.uid);
    }
  }, [])

  useEffect(() => {
    if (user) {
      userDataRequest(user.uid)
        .then(() => {
          return;
        })
    } else {
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
        if (doc.exists) {
          const userData = doc.data() as UserDataType
          setUserData(userData)
        }
      })
      .catch((error: string) => {
        console.error(error)
      });
  }, [])

  const userDataUpdate = useCallback(async (userUid: string, userData: UserDataType) => {
    firebase
      .firestore()
      .collection(FirebaseDBCollection.UsersData)
      .doc(userUid)
      .set(userData)
      .then(() => {
        setUserData(userData);
      })
      .catch((error: string) => {
        console.error(error);
      });
  }, [])

  const signUp = useCallback((email: string, password: string, displayName: string) => {
    const emptyUserData = {
      workoutsUIDs: [],
      plansUIDs: [],
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
          response.user.updateProfile({displayName})
            .then(() => {
              userDataUpdate(response.user?.uid || '', emptyUserData)
              asyncStorage
                .set(AsyncStorageKey.User, response.user)
                .then(() => setUser(response.user))
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
        await userDataRequest(response.user?.uid || '')
        asyncStorage
          .set(AsyncStorageKey.User, response.user)
          .then(() => setUser(response.user as UserType))
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
          .then(() => setUser(null))
      });
  }, []);

  return {
    user,
    userData,
    userDataUpdate,
    signUp,
    signIn,
    signOut
  }
}