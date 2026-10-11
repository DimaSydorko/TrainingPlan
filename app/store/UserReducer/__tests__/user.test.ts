// @ts-nocheck -- jest globals are untyped until A7 adds the Jest tooling (@types/jest); remove then.
jest.mock('../../../Utils/firebase', () => ({
  auth: { name: 'auth' },
  db: {},
  rtdb: {},
  usersDataCollection: { path: 'usersData' },
  plansCollection: { path: 'plans' },
  workoutsCollection: { path: 'workouts' },
  publicationsCollection: { path: 'publications' },
}))
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithCredential: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  GoogleAuthProvider: { credential: jest.fn(token => ({ token })) },
}))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((col, id) => ({ path: `${col.path}/${id}` })),
  getDoc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
}))
jest.mock('firebase/database', () => ({}))
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn() }))
jest.mock('../../../services/googleAuth', () => ({
  getGoogleIdToken: jest.fn(),
  signOutGoogle: jest.fn(() => Promise.resolve()),
}))

import * as fbAuth from 'firebase/auth'
import * as firestore from 'firebase/firestore'
import * as google from '../../../services/googleAuth'
import reducer, { authUserChanged, errorUserClear, sessionEnded } from '../UserSlice'
import { userAC } from '../UserAC'

const fbUser = { uid: 'u1', displayName: 'Ann', photoURL: null, email: 'a@b.c' }
const user = { uid: 'u1', displayName: 'Ann', photoURL: null, email: 'a@b.c' }
const initial = () => reducer(undefined, { type: '@@init' })
const run = (thunk, state = {}) => thunk(jest.fn(), () => state, undefined)

beforeEach(() => jest.clearAllMocks())

describe('UserSlice', () => {
  it('logs in, clears errors and logs out', () => {
    let s = reducer(initial(), userAC.signIn.fulfilled(user, 'r', { email: '', password: '' }))
    expect(s.user).toEqual(user)
    s = reducer({ ...s, error: 'x' }, errorUserClear())
    expect(s.error).toBe('')
    s = reducer(s, userAC.signOut.fulfilled(undefined, 'r'))
    expect(s.user).toBeNull()
  })

  it('authUserChanged and sessionEnded follow the Firebase session', () => {
    let s = reducer(initial(), authUserChanged(user))
    expect(s.user).toEqual(user)
    s = reducer({ ...s, data: { friendsUIDs: [] }, isLoading: true }, sessionEnded())
    expect(s).toEqual({ ...initial(), error: s.error })
  })

  it('Google sign-in sets loading and reports errors', () => {
    let s = reducer(initial(), userAC.signInWithGoogle.pending('r'))
    expect(s.isLoading).toBe(true)
    s = reducer(s, userAC.signInWithGoogle.rejected(null, 'r', undefined, 'cancelled'))
    expect(s).toMatchObject({ isLoading: false, error: 'cancelled' })
  })
})

describe('userAC thunks', () => {
  it('signIn uses modular auth and returns the stored user shape', async () => {
    fbAuth.signInWithEmailAndPassword.mockResolvedValue({ user: fbUser })
    const action = await run(userAC.signIn({ email: 'a@b.c', password: 'pw' }))
    expect(fbAuth.signInWithEmailAndPassword).toHaveBeenCalledWith({ name: 'auth' }, 'a@b.c', 'pw')
    expect(action.payload).toEqual(user)
  })

  it('signUp creates the user, writes initial data and sets the display name', async () => {
    const created = { ...fbUser, displayName: null }
    fbAuth.createUserWithEmailAndPassword.mockResolvedValue({ user: created })
    fbAuth.updateProfile.mockImplementation(async (u, { displayName }) => {
      u.displayName = displayName
    })
    const dispatch = jest.fn()
    const action = await userAC.signUp({ email: 'a@b.c', password: 'pw', displayName: 'Ann' })(dispatch, () => ({}), undefined)
    expect(fbAuth.updateProfile).toHaveBeenCalledWith(created, { displayName: 'Ann' })
    expect(action.payload.displayName).toBe('Ann')
    expect(dispatch).toHaveBeenCalled()
  })

  it('signInWithGoogle exchanges the Google id token for a Firebase credential', async () => {
    google.getGoogleIdToken.mockResolvedValue('id-token')
    fbAuth.signInWithCredential.mockResolvedValue({ user: fbUser })
    const action = await run(userAC.signInWithGoogle())
    expect(fbAuth.GoogleAuthProvider.credential).toHaveBeenCalledWith('id-token')
    expect(fbAuth.signInWithCredential).toHaveBeenCalledWith({ name: 'auth' }, { token: 'id-token' })
    expect(action.payload).toEqual(user)
  })

  it('signInWithGoogle rejects with the seam error (e.g. cancel)', async () => {
    google.getGoogleIdToken.mockRejectedValue(new Error('cancelled'))
    const action = await run(userAC.signInWithGoogle())
    expect(action.type).toBe('user/signInWithGoogle/rejected')
    expect(action.payload).toBe('cancelled')
  })

  it('signOut signs out of Firebase even if Google sign-out fails', async () => {
    google.signOutGoogle.mockRejectedValueOnce(new Error('not signed in'))
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const action = await run(userAC.signOut())
    expect(fbAuth.signOut).toHaveBeenCalledWith({ name: 'auth' })
    expect(action.type).toBe('user/signOut/fulfilled')
    warn.mockRestore()
  })

  it('dataRequest and dataUpdate read and write usersData/{uid}', async () => {
    firestore.getDoc.mockResolvedValue({ data: () => ({ friendsUIDs: ['x'] }) })
    expect((await run(userAC.dataRequest('u1'))).payload).toEqual({ friendsUIDs: ['x'] })
    expect(firestore.getDoc.mock.calls[0][0].path).toBe('usersData/u1')
    await run(userAC.dataUpdate({ userUid: 'u1', data: { friendsUIDs: [] } }))
    expect(firestore.setDoc).toHaveBeenCalledWith({ path: 'usersData/u1' }, { friendsUIDs: [] })
  })
})
