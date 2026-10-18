# Store templates

## App-wide store

`app/stores/workouts-ui/use-workouts-ui-store.ts`

```ts
import { create } from 'zustand'

type WorkoutsUiState = {
  selectedWorkoutId: WorkoutId | null
  sortedWorkoutIds: WorkoutId[]
  selectWorkout: (workoutId: WorkoutId | null) => void
  setSortedWorkoutIds: (workoutIds: WorkoutId[]) => void
  reset: () => void
}

const INITIAL_STATE = {
  selectedWorkoutId: null,
  sortedWorkoutIds: [],
}

export const useWorkoutsUiStore = create<WorkoutsUiState>()(set => ({
  ...INITIAL_STATE,
  selectWorkout: selectedWorkoutId => set({ selectedWorkoutId }),
  setSortedWorkoutIds: sortedWorkoutIds => set({ sortedWorkoutIds }),
  reset: () => set(INITIAL_STATE),
}))
```

## Persisted store (settings)

`app/stores/settings/use-settings-store.ts`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { colorsDark, colorsLight } from '../../Theme/colors'
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, SETTINGS_STORE_VERSION } from './settings.constants'
import type { Settings } from './settings.types'

type SettingsState = Settings & {
  setThemeName: (themeName: Settings['themeName']) => void
  toggleVibration: () => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      setThemeName: themeName => set({ themeName }),
      toggleVibration: () => set(state => ({ isVibration: !state.isVibration })),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: SETTINGS_STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ themeName, isVibration, isSaveBatteryMode, tts, sound, workout }) => ({
        themeName,
        isVibration,
        isSaveBatteryMode,
        tts,
        sound,
        workout,
      }),
    }
  )
)

export const useThemeColors = () => useSettingsStore(state => (state.themeName === 'dark' ? colorsDark : colorsLight))
```

## Notes

-   `type`, no `I` prefix; single quotes, no semicolons; no `any`.
-   App-wide stores always have `reset()`.
-   Components read with selectors: `useWorkoutsUiStore(s => s.selectedWorkoutId)`; several fields → `useShallow`.
-   Screen-local stores live in `app/Screens/<Screen>/stores/` and usually need no `reset()`.
