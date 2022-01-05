// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app';
// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';
import {firebaseSDK} from "../../constants.local";


const firebaseConfig = {
  apiKey: firebaseSDK.API_KEY,
  authDomain: firebaseSDK.AUTH_DOMAIN,
  databaseURL: firebaseSDK.DATABASE_URL,
  projectId: firebaseSDK.PROJECT_ID,
  storageBucket: firebaseSDK.STORAGE_BUCKET,
  messagingSenderId: firebaseSDK.MESSAGING_SENDER_ID,
  appId: firebaseSDK.APP_ID
};


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
