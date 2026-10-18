## Code Style

### Formatting

-   Code is formatted by Prettier (`.prettierrc.js`): single quotes (also `jsxSingleQuote`), **no semicolons**,
    2-space indent, `printWidth: 120`, `trailingComma: 'es5'`, `arrowParens: 'avoid'`. Run `npm run format`.
-   ESLint 9 flat config (`eslint.config.js`, based on `eslint-config-expo`) is the style/lint gate: `npm run lint`.
    Do not add new warnings.
-   Import dependencies at the top of the file. Import local functions/components/assets beneath dependencies.
-   No unused imports, props, or keys in types
-   No `var` — use `const` and `let`
-   Padding blank line after a block of `const` / `let` declarations
-   Newline at end of every file

### Naming and Consistency

-   Meaningful, self-explaining names. No single-character names (except `_` for an intentionally unused arg).
-   Variables and functions in camelCase. No encodings like `m_` or `_variableName`.
-   Function names describe their side effects. Methods are verbs (`savePlan`, `deleteWorkout`);
    accessors/predicates prefixed with `get`, `set`, `is`, `has`.
-   One lexicon per concept — don't mix `fetch`, `load`, `get` for the same operation. Fetchers in `app/api` are
    `get*` / `create*` / `update*` / `delete*`; React Query hooks are `use*`.
-   Components in PascalCase. Constants in SCREAMING_SNAKE_CASE.
-   **Files and folders: kebab-case** (`workout-card/workout-card.tsx`, `use-plans.ts`, `query-keys.ts`); ESLint
    `check-file` errors otherwise. Exempt: `__tests__/` folder names, snake_case sound assets.
-   **Imports:** another core folder → `@<folder>/…` (`@store/…`, `@utils/types`, `@common`); same core folder →
    relative. Aliases: tsconfig `paths` + `moduleNameMapper` in `jest.config.js` — add a new core folder to both.
-   Event handler functions `handle*` (`handlePress`), callback props `on*` (`onPress`). See
    [naming event handlers](https://jaketrent.com/post/naming-event-handlers-react/).
-   English only in identifiers.
-   No code comments (incl. JSDoc, TODO). Express intent through names and small functions.
-   Called functions below calling functions. Keep functions small. No magic numbers.

### Types

-   No explicit `any` — use `unknown` and narrow, or a proper type. (`strict` is still off in `tsconfig.json`; write
    new code as if `strictNullChecks` were on.)
-   **Use `type`, never `interface`** — for object shapes, unions, intersections, props and store state alike.
-   No `I` prefix. Name types after what they describe (`Plan`, `UsePlansArgs`, `CreatePlanArgs`, `SettingsState`).
-   Component props type = ComponentName + `Props` (`WorkoutCardProps`).
-   Existing `interface` / `I`-prefixed / `*Type`-suffixed declarations are legacy — convert when you touch that
    declaration (boy scout rule); no sweeping rename commit. ESLint warns via
    `@typescript-eslint/consistent-type-definitions`.
-   Derive instead of duplicating: `Pick`, `Omit`, `ReturnType`, `Tables<'plans'>` (only inside `app/api`).
-   Prefer `as const` objects + derived unions over `enum` in new code
    (`type TabName = (typeof TAB_NAMES)[keyof typeof TAB_NAMES]`). Existing enums (`ScreenName`, …) stay.

### Styles

See `styles.md`. In short: `StyleSheet.create` in a co-located `<name>.styles.ts`; colors from the theme; inline
style objects only for runtime values.

### Accessibility and testability

-   Every touchable (`Pressable`, `TouchableOpacity`, `IconButton`) has `accessibilityRole` and, when it has no
    visible text, an `accessibilityLabel`.
-   Use `accessibilityState` for disabled/selected/checked.
-   Elements used by Maestro flows or tests get a `testID` in `screen.element` form (`login.submit`,
    `workouts.add`). Never rename an existing `testID` without updating `e2e/`.
-   Touch targets are at least 44×44 pt (use `hitSlop` for small icons).

### Async patterns

-   No `await` inside `for…of` loops for independent work — use `Promise.all(items.map(...))`.
-   For sequential work where order matters, a plain `for…of` with `await` is fine.
-   No floating promises: `await` them, return them, or `.catch()` and report.
-   Timers / subscriptions created in an effect are cleaned up in its return function.

### Support and maintainability

-   Decompose and decouple — smaller components are easier to extend, test and understand.
-   Boy scout rule — leave the place cleaner than you found it (but keep unrelated refactors out of the diff).

### Component usage — `common/` and `components/` first

**Hard rule: if `app/common` has a component that covers the use case, never import the underlying library
primitive directly.**

#### `app/common/` — generic building blocks (no business logic)

| Component            | Use instead of / for                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `Icon`               | any icon — never `@react-native-vector-icons/*` directly (ESLint-enforced)  |
| `IconButton`         | icon-only touchables                                                        |
| `ConfirmButton`      | primary/footer action buttons                                               |
| `AddMoreButton`      | "add item" floating button                                                  |
| `AppModal`           | any modal — never React Native `Modal` directly                             |
| `GoBackSubmitModal`  | "discard changes?" confirmation on leave                                    |
| `MyTextInput`        | text inputs                                                                 |
| `MySwitch`           | toggles                                                                     |
| `SwipeSelector`      | number/time pickers                                                         |
| `ButtonCounter`      | +/- counters                                                                |
| `DraggableList`      | reorderable lists — never `react-native-draggable-flatlist` directly        |
| `InfiniteScroll`     | paginated lists                                                             |
| `Loading`            | loading states                                                              |
| `Toast` / `Toaster`  | user feedback                                                               |
| `AppImage`           | images                                                                      |
| `Labels` / `LabelsInput` | tag display / editing                                                   |
| `Timer`              | countdown display                                                           |
| `TapBar`             | segmented tabs                                                              |

Text and layout wrappers live in `app/theme/parents.tsx` (`Page`, themed text).

#### `app/components/` — business-aware reusable components

`Exercise`, `EditPlanWorkout`, `Publication`, `ShareModal`, `CopyWorkoutsModal`, `ImageSelector`,
`AppColorPicker`, `AppSoundPicker`, `WorkoutDuration`, `UserImage`, `NotificationHandler`. They may use hooks from
`app/services` / stores. Extend them with a prop rather than creating a parallel component.

#### Import style

-   New code imports components directly from their file (`../../Common/Icon/Icon`, `../workout-card/workout-card`).
-   Do not add new entries to the legacy barrels (`app/common/index.ts`, `app/screens/index.ts`). Existing barrel
    imports may stay.

#### Where does a new component go?

-   **`app/common/`**: generic UI with no domain knowledge.
-   **`app/components/`**: reusable and knows about plans/workouts/exercises/publications.
-   **Screen-private**: `app/screens/<screen-name>/components/<component-name>/`.
-   If nothing covers 70%+ of the use case, create a new component. Never create a near-duplicate.
