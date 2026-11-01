import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app'
import { Database, getDatabase } from 'firebase/database'

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

// Realtime Database: holds the exercise GIF catalogue (FirebaseDatabase.ExerciseImages).
export const rtdb: Database = getDatabase(app)
