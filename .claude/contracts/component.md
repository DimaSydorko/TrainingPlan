## New Component Contract

### Placement

-   `app/common/<component-name>/` — generic reusable UI (no domain knowledge)
-   `app/components/<component-name>/` — reusable component that knows about plans/workouts/exercises/publications
-   `app/screens/<screen-name>/components/<component-name>/` — component private to one screen
-   `app/screens/<screen-name>/` — a new screen

### Complexity tiers

| Tier         | When to use                                         | Files                                                                           |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Minimal**  | Pure presentational, no own styles                  | `component-name.tsx`                                                            |
| **Standard** | Has styles; optionally constants/helpers            | `component-name.tsx` + `component-name.styles.ts` (+ `component-name.constants.ts`) |
| **Complex**  | Has sub-components, contexts or co-located hooks    | Standard files + `components/`, `hooks/` subfolders                             |

### Naming

-   Component name: PascalCase (`WorkoutCard`)
-   Folder and file names: kebab-case (`workout-card/workout-card.tsx`)
-   Props type: `ComponentNameProps`
-   Constants: SCREAMING_SNAKE_CASE
-   Callback props: `on` prefix (`onClose`); local handlers: `handle` prefix (`handleClose`)
-   `testID`: `screen.element` (`workouts.add`)

### TypeScript

-   `type`, never `interface`; no `I` prefix
-   No explicit `any`
-   When wrapping a React Native primitive, extend its props: `PressableProps & { … }`, `ViewProps & { … }`
-   `?` for optional props; defaults in destructuring, not in the type

### Exports

-   `export default ComponentName` — no named component exports in new files
-   No new `index.ts` barrels; consumers import the file directly

### Import order

```tsx
import { useState } from 'react'
import { Pressable, View } from 'react-native'

import { useSettings } from '../../Hooks/redux'
import { TextHeader } from '../../Theme/Parents'
import { Icon } from '../../Common/Icon/Icon'
import { WORKOUT_CARD_ICON_SIZE } from './workout-card.constants'
import styles from './workout-card.styles'
```

-   Single quotes, no semicolons
-   Blank line between dependency and local sections
-   Styles imported last

### Styles

See `styles.md`: `StyleSheet.create` in `<name>.styles.ts`, theme colors, inline objects only for runtime values.

### Component body

-   Declare hooks and derived values at the top of the function body
-   Early `return null` for "nothing to render" — no nested ternaries in JSX
-   Presentational components take data via props; containers (screens, `components/`) call hooks from
    `app/services` / stores and pass data down
-   Wrap list items rendered in `FlatList` with `memo` and pass stable callbacks (`useCallback`)
-   Keep components small; extract sections into `components/` when they grow
-   No magic numbers, no `var`, no unused props or imports

---

## Reuse Before Create

Before writing any component, hook, type or constant, search for an existing one:

```bash
rg -i "<concept>" app/common app/components app/hooks app/utils app/theme app/platform app/services app/stores
```

If it renders the same primary element and ≤1 new optional prop would cover you, **extend it with a prop** — do
not create a parallel version. A new component is justified only when you'd otherwise add ≥2 behavioral props or
branch its JSX.

### Never import a library primitive when a wrapper exists

| Never import                                         | Always import                                |
| ---------------------------------------------------- | -------------------------------------------- |
| `@react-native-vector-icons/*`, `@expo/vector-icons` | `app/common/icon/icon` (ESLint-enforced)     |
| React Native `Modal`                                 | `app/common/app-modal/app-modal`               |
| React Native `Switch`                                | `app/common/my-switch/my-switch`               |
| React Native `TextInput` (for form fields)           | `app/common/my-text-input/my-text-input`         |
| `react-native-draggable-flatlist`                    | `app/common/draggable-list/draggable-list`     |
| `expo-audio`, `expo-speech`, `expo-keep-awake`, `expo-notifications`, `@react-native-google-signin/*` | the matching `app/platform/*` seam |

Verify with `rg "from '@react-native-vector-icons|from 'expo-audio|from 'expo-speech" app --glob '!app/platform/**' --glob '!app/common/icon/**'`
— it must add zero new hits.

### Extend with a prop — never fork a near-duplicate

If two components differ only by copy, an icon or one flag, they are **one parameterized component**. Forks
duplicate markup, styles, a11y and bug surface, then drift.

### When NOT to deduplicate

Deduplicate only when copies represent the **same knowledge that must always change together**. If a "shared"
component would have more optional props than required ones, or its JSX is mostly conditional branches, split it
into two focused components instead.
