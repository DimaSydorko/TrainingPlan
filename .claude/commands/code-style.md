Review ALL code you just wrote or modified against the rules below (full rules: `.claude/contracts/code-style.md`,
`styles.md`, `component.md`, `constants.md`). Fix every violation before responding.

## Checklist

### Files

-   [ ] New folders and files are kebab-case (`workout-card/workout-card.tsx`, `use-plans.ts`)
-   [ ] Newline at end of every file
-   [ ] Constants in a co-located `<name>.constants.ts`; styles in `<name>.styles.ts`
-   [ ] No new `index.ts` barrels and no new entries in legacy barrels

### Imports

-   [ ] External/library imports first, then local imports
-   [ ] No unused imports
-   [ ] No native/library primitive where a `Common/` or `platform/` wrapper exists
-   [ ] Layers respected: no `@supabase/supabase-js` / `app/lib/supabase` / `app/api` outside their allowed layers;
        no new `react-redux` or `firebase` usage

### Formatting

-   [ ] Single quotes (also in JSX), no semicolons — `npm run format` is clean
-   [ ] Padding blank line after `const`/`let` declaration blocks

### Naming

-   [ ] Components PascalCase; constants SCREAMING_SNAKE_CASE; functions/variables camelCase
-   [ ] Handlers `handleX`, callback props `onX`
-   [ ] No single-character names; durations carry a unit (`restSec`, `delayMs`)
-   [ ] `testID` in `screen.element` form; existing `testID`s unchanged

### Types

-   [ ] No explicit `any`
-   [ ] `type` only — no new `interface`; no `I` prefix
-   [ ] Props type `ComponentNameProps`
-   [ ] `as const` objects + derived unions instead of new `enum`s
-   [ ] No unused props or type keys

### Styles

-   [ ] `StyleSheet.create`; no static values in inline style objects
-   [ ] No hardcoded colors — theme palette or `colorsFixed`; works in light and dark
-   [ ] No magic numbers

### React / React Native

-   [ ] No `var`
-   [ ] Touchables have `accessibilityRole` (+ `accessibilityLabel` when icon-only)
-   [ ] Effects clean up timers/subscriptions; no floating promises
-   [ ] Server data via `app/services` hooks, client state via `app/stores` selectors

### Verify

```bash
npx tsc --noEmit && npm run lint && npm test
```
