// Pure helpers for keeping the persisted Redux user in step with the Firebase Auth session.
import type { User } from 'firebase/auth'
import { UserType } from '../../Utils/types'

type AuthUserLike = Pick<User, 'uid' | 'displayName' | 'photoURL' | 'email'>

/** Same shape the thunks stored before the migration. */
export function toUserType(user: AuthUserLike | null | undefined): UserType {
  return {
    uid: user?.uid,
    displayName: user?.displayName || '',
    photoURL: user?.photoURL,
    email: user?.email,
  } as UserType
}

export type AuthChange =
  | { type: 'none' }
  | { type: 'login'; user: UserType }
  | { type: 'update'; user: UserType }
  | { type: 'logout' }

/**
 * Decides what onAuthStateChanged should do to the Redux user.
 * - Firebase has a user and Redux doesn't (or has another uid): log in.
 * - Same uid but profile fields changed (e.g. displayName set after sign-up): update.
 * - Firebase has no user but Redux does: the session is gone (token revoked, or it was never
 *   persisted, e.g. builds that ran on the compat layer). Clear the user so the login screen shows,
 *   instead of letting every Firestore call fail with permission-denied.
 */
export function resolveAuthChange(
  reduxUser: UserType | null | undefined,
  firebaseUser: AuthUserLike | null
): AuthChange {
  if (!firebaseUser) return reduxUser?.uid ? { type: 'logout' } : { type: 'none' }
  const user = toUserType(firebaseUser)
  if (!reduxUser?.uid || reduxUser.uid !== user.uid) return { type: 'login', user }
  const changed =
    reduxUser.displayName !== user.displayName || reduxUser.photoURL !== user.photoURL || reduxUser.email !== user.email
  // Don't overwrite a displayName with an empty one while updateProfile() is still running after sign-up.
  if (changed && !(user.displayName === '' && reduxUser.displayName)) return { type: 'update', user }
  return { type: 'none' }
}
