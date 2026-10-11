# A1: Data and Firebase

## Mission
Move the data layer from the Firebase compat shim to the **modular Firebase JS SDK** and bring Redux up to RTK 2 and react-redux 9. Users who update must keep their existing data.

## Branch
`migration/a1-data` (worktree `../tp-a1-data`), created from `migration/expo` after A0 has merged.

## Owns
`app/Utils/firebase.ts`, `app/store/**`, `app/Hooks/redux.ts`

## Do not touch
Screens and components. If a selector or action signature has to change, keep a compatible export, or update the caller with a minimal edit and list it in your handoff.

## Context
- `firebase.ts` exports `FB_Auth`, `FB_Store` (storage), `FB_Database` (Realtime DB), `FB_FieldValue`, and four Firestore collection refs: UsersData, Workouts, Plans, Publications. It also sets `experimentalForceLongPolling: true`.
- The thunks that use these live in `PlansAC.ts`, `PublicationsAC.ts`, `UserAC.ts`, and `WorkoutAC.ts`.
- Realtime Database **is** used: `WorkoutAC.ts` reads `FB_Database.ref(FirebaseDatabase.ExerciseImages)`, the exercise GIF catalogue. Port it to `getDatabase` / `ref` / `get`. `FB_Store` (Storage) and `firebase/functions` look unused, so confirm and remove them if so.

## Tasks
1. **Firebase initialization** (`firebase.ts`)
   - `initializeApp(config)`, with config read from `EXPO_PUBLIC_FIREBASE_*`.
   - `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`. Handle hot reload with `getApps().length` / `getAuth`.
   - `initializeFirestore(app, { experimentalAutoDetectLongPolling: true })`. Only fall back to forcing long polling if auto-detection fails on device, and write down why.
   - Export typed collection references (`collection(db, FirebaseDBCollection.X)`) and the `db`, `auth`, and `storage` instances. Stop exporting the compat namespace.
2. **Convert every thunk** to modular calls: `doc`, `getDoc`, `getDocs`, `query`, `where`, `orderBy`, `limit`, `startAfter`, `setDoc`, `updateDoc`, `deleteDoc`, `arrayUnion`, `increment`, `serverTimestamp`, `onSnapshot`, `writeBatch`/`runTransaction`, and Storage `ref`/`uploadBytes`/`getDownloadURL`. Keep the Firestore document shapes **exactly the same**, because the admin panel and existing users rely on them.
3. **Auth** in `UserAC.ts`: email sign-up and sign-in, sign-out, and `onAuthStateChanged`. For Google sign-in, call `getGoogleIdToken()` from `app/services/googleAuth.ts` (A2's seam), then `signInWithCredential(auth, GoogleAuthProvider.credential(idToken))`. On sign-out, call `signOutGoogle()`.
4. **Redux**
   - RTK 2 migration: switch `createSlice` `extraReducers` from the object form to builder callbacks (the object form was removed), and convert `configureStore` middleware to the callback form.
   - react-redux 9: replace typed hooks with `useDispatch.withTypes<AppDispatch>()` / `useSelector.withTypes<RootState>()` in `app/Hooks/redux.ts`.
   - redux-persist: keep the **same persist `key`, `version`, and whitelist** so stored state rehydrates. If the shape has to change, add a `migrate` step and a version bump. Configure the serializable-check ignore list for persist actions.
5. **Remove** the compat imports and any leftover `firebase` namespace usage. Confirm with `grep -r "firebase/compat\|from 'firebase'" app`, which should return nothing.
6. **Tests**, using A7's Jest setup once it's merged, or a local one meanwhile: write reducer unit tests for each slice, and thunk tests with the Firebase modules mocked, covering at least the plan and workout save/load paths.

## Acceptance criteria
- [ ] No compat imports anywhere.
- [ ] On a device: register, log in, log out, then kill and reopen the app; the session is still active.
- [ ] Create, edit, reorder, and delete a workout and a plan; the changes are visible in the Firebase console.
- [ ] Publish a workout and a plan, browse publications with pagination, and copy someone else's publication.
- [ ] Installing over a build of the old app keeps the stored settings (theme, sound, TTS) and the cached data.
- [ ] `tsc`, lint, and tests all pass.

## Handoff
Fill in `handoff/A1.md`: any changed exports, persist versioning, the long-polling decision, and what still needs A2's merge to test (Google login end to end).
