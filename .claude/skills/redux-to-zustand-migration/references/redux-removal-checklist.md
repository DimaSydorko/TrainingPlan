# Redux removal checklist

Run only after every slice's fields have moved (server data → React Query, client state → Zustand).

## Audit

```bash
rg "useAppSelector|useAppDispatch|use(User|Plans|Workout|Settings|Publications)\(" app
rg "from 'react-redux'|from '@reduxjs/toolkit'|from 'redux-persist" app __tests__
rg "Reducer/|store/index|AC\." app
```

Every hit is either already replaced (delete it) or a missed consumer (stop and migrate it).

## Removal (separate commits, in order)

1. **Consumers and providers:** remove `Provider` and `PersistGate` from `app/app.tsx`; delete `app/hooks/redux.ts`.
2. **Store code:** delete `app/store/` (slices, thunks, `sync.ts`, `firestore.ts` if Firebase is already gone) and
   its tests; delete `__tests__/utils/test-store.ts` and `renderWithStore`; update tests to the new utils.
3. **Packages:** `npm uninstall @reduxjs/toolkit react-redux redux redux-persist`; remove them from the Jest
   `transformIgnorePatterns` allow-list.
4. **Persisted key:** one release later, remove the legacy `persist:root` read from the settings store and delete
   the key on startup (`AsyncStorage.removeItem('persist:root')`).

After each commit: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npx expo export --platform android`.

## Do NOT

-   Combine removal with feature work
-   Skip the audit greps
-   Use `--no-verify`
