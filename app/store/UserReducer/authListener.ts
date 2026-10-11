import { onAuthStateChanged, Unsubscribe } from 'firebase/auth'
import { auth } from '../../Utils/firebase'
import type { AppStore } from '../index'
import { resolveAuthChange } from './authState'
import { authUserChanged, sessionEnded } from './UserSlice'
import { userAC } from './UserAC'

/**
 * Keeps the Redux user in step with Firebase Auth. Call it after redux-persist has rehydrated,
 * otherwise the first callback compares against an empty store.
 */
export function listenToAuthChanges(store: AppStore): Unsubscribe {
  return onAuthStateChanged(auth, firebaseUser => {
    const { user, isLoading } = store.getState().userReducer
    const change = resolveAuthChange(user, firebaseUser)
    switch (change.type) {
      case 'login':
        store.dispatch(authUserChanged(change.user))
        // While a sign-in/sign-up thunk runs, it loads (or creates) the user data itself.
        if (!isLoading) store.dispatch(userAC.dataRequest(change.user.uid))
        break
      case 'update':
        store.dispatch(authUserChanged(change.user))
        break
      case 'logout':
        store.dispatch(sessionEnded())
        break
    }
  })
}
