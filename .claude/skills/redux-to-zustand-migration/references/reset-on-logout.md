# Reset on logout

User-specific client state must not leak into the next session.

`app/stores/reset-stores.ts`

```ts
import { usePlaybackStore } from './playback/use-playback-store'
import { useWorkoutsUiStore } from './workouts-ui/use-workouts-ui-store'

export const resetStores = () => {
  usePlaybackStore.getState().reset()
  useWorkoutsUiStore.getState().reset()
}
```

The logout flow (today `userAC.signOut`; target the auth sign-out in `app/api/auth` + its hook) calls:

```ts
resetStores()
queryClient.clear()
```

Device preferences in the settings store (theme, sounds, TTS) survive logout by design; say so in the store file.

## Verification

Sign out, sign in as another user: no selected workout, no playback session, no cached lists from the previous
user. Add a unit test that `resetStores()` restores each store's initial state.
