---
name: components
description: Create a new React Native component or modify an existing one in this app, following the component, styles and constants contracts (kebab-case files, type-only props, StyleSheet in <name>.styles.ts, theme colors, common/ wrappers first). Use when the user asks to add, build, split or refactor a component or screen.
---

# Create or modify a component

> Rules: `.claude/contracts/component.md`, `.claude/contracts/styles.md`, `.claude/contracts/constants.md`,
> `.claude/contracts/code-style.md`. This file is the recipe.

## Step 1 — Search before create

```bash
rg -i "<concept>" app/common app/components app/screens app/hooks
```

Extend an existing component with an optional prop if that covers the case (component.md → Reuse Before Create).

## Step 2 — Placement and tier

Pick the folder (`common/`, `components/`, `screens/<screen-name>/components/`) and the tier (Minimal / Standard /
Complex) from `component.md`. New folders and files are kebab-case.

## Step 3 — Templates

`workout-card/workout-card.tsx`

```tsx
import { memo } from 'react'
import { Pressable } from 'react-native'

import { useSettings } from '../../Hooks/redux'
import { TextHeader } from '../../Theme/Parents'
import styles from './workout-card.styles'

type WorkoutCardProps = {
  title: string
  exercisesCount: number
  isSelected?: boolean
  onPress: () => void
}

const WorkoutCard = ({ title, exercisesCount, isSelected = false, onPress }: WorkoutCardProps) => {
  const { colors } = useSettings()

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected: isSelected }}
      style={[styles.container, { backgroundColor: isSelected ? colors.primary : colors.background }]}
      onPress={onPress}
      testID='workouts.card'
    >
      <TextHeader>{title}</TextHeader>
      <TextHeader>{exercisesCount}</TextHeader>
    </Pressable>
  )
}

export default memo(WorkoutCard)
```

`workout-card/workout-card.styles.ts`

```ts
import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
})
```

`workout-card/workout-card.constants.ts` — only when the component has constants (then always in this file).

## Step 4 — Data

-   Presentational components get data via props.
-   Containers (screens, `components/`) get server data from `app/services/<entity>` hooks and UI state from
    `app/stores` — not from new Redux selectors. Legacy screens that still use `useAppSelector` may keep it until
    their entity is migrated.
-   Theme colors: `useSettings().colors` today; the settings store selector after the Zustand migration.

## Step 5 — Tests

`app/__tests__/components/workout-card/workout-card.test.tsx` — a render test and an interaction test (see `/unit-tests`).

```tsx
import { screen, userEvent } from '@testing-library/react-native'

import WorkoutCard from '@components/workout-card/workout-card'

import { renderWithStore } from '../../utils/render'

describe('WorkoutCard', () => {
  it('calls onPress when tapped', async () => {
    const handlePress = jest.fn()
    const user = userEvent.setup()

    await renderWithStore(<WorkoutCard title='Legs' exercisesCount={5} onPress={handlePress} />)
    await user.press(screen.getByRole('button'))

    expect(handlePress).toHaveBeenCalledTimes(1)
  })
})
```

## Checklist before finishing

-   [ ] Folder and file names kebab-case; component PascalCase; props type `ComponentNameProps` (`type`)
-   [ ] Default export; no new barrel entry
-   [ ] Static styles in `<name>.styles.ts`; no hardcoded colors; inline objects only for runtime values
-   [ ] Works in light and dark theme
-   [ ] `accessibilityRole` / `accessibilityLabel` on touchables; `testID` where tests or Maestro need it
-   [ ] No `any`, no `var`, no unused props/imports; handlers `handleX`, props `onX`
-   [ ] Tests added; `npx tsc --noEmit`, `npm run lint`, `npm test` pass
