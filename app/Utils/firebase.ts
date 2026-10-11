// Firebase modular JS SDK (D2). Auth is persisted with AsyncStorage so the session survives restarts.
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app'
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth'
import { collection, CollectionReference, DocumentData, Firestore, getFirestore, initializeFirestore } from 'firebase/firestore'
import { Database, getDatabase } from 'firebase/database'
import { FirebaseDBCollection } from './constants'

// Was read from the gitignored constants.local.ts (firebaseSDK). Keys are listed in .env.example.
// EXPO_PUBLIC_* must be referenced literally (process.env.EXPO_PUBLIC_X) so Metro can inline them.
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

if (__DEV__ && !firebaseConfig.apiKey) {
  console.warn('[firebase] EXPO_PUBLIC_FIREBASE_* env vars are missing. Copy .env.example to .env and fill it in.')
}

// getApps() guards against double initialisation on Fast Refresh.
const isFirstInit = getApps().length === 0
export const app: FirebaseApp = isFirstInit ? initializeApp(firebaseConfig) : getApp()

const createAuth = (): Auth => {
  if (!isFirstInit) return getAuth(app)
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  } catch {
    // initializeAuth throws auth/already-initialized if it was called before for this app.
    return getAuth(app)
  }
}

const createFirestore = (): Firestore => {
  if (!isFirstInit) return getFirestore(app)
  try {
    // The old app forced long polling (WebChannel streaming is unreliable on React Native).
    // Auto-detection picks long polling when it is needed and is the SDK default since v10;
    // switch to `experimentalForceLongPolling: true` only if device testing shows Firestore hanging.
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  } catch {
    return getFirestore(app)
  }
}

export const auth: Auth = createAuth()
export const db: Firestore = createFirestore()
// Realtime Database: holds the exercise GIF catalogue (FirebaseDatabase.ExerciseImages).
export const rtdb: Database = getDatabase(app)

const col = (name: FirebaseDBCollection) => collection(db, name) as CollectionReference<DocumentData>

export const usersDataCollection = col(FirebaseDBCollection.UsersData)
export const workoutsCollection = col(FirebaseDBCollection.Workouts)
export const plansCollection = col(FirebaseDBCollection.Plans)
export const publicationsCollection = col(FirebaseDBCollection.Publications)
