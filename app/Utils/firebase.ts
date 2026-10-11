// Firebase App (the core Firebase SDK) is always required and must be listed first
// TODO(A1): Phase 0 uses the compat layer (v8 namespaced API on the current SDK). Convert to the
// modular API with getReactNativePersistence(AsyncStorage); compat auth only persists in memory on RN.
import firebase from 'firebase/compat/app'
// Add the Firebase products that you want to use
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/database'
import 'firebase/compat/storage'
import 'firebase/compat/functions'
import { FirebaseDBCollection } from './constants'

// Was read from the gitignored constants.local.ts (firebaseSDK). Keys are listed in .env.example.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
  firebase.firestore().settings({ experimentalForceLongPolling: true })
}

export const FB_Auth = firebase.auth()
export const FB_Store = firebase.storage()
export const FB_Database = firebase.database()
export const FB_FieldValue = firebase.firestore.FieldValue
export const FB_Collection_UsersData = firebase.firestore().collection(FirebaseDBCollection.UsersData)
export const FB_Collection_Workouts = firebase.firestore().collection(FirebaseDBCollection.Workouts)
export const FB_Collection_Plans = firebase.firestore().collection(FirebaseDBCollection.Plans)
export const FB_Collection_Publications = firebase.firestore().collection(FirebaseDBCollection.Publications)

export default firebase
