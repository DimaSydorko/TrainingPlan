## Styles

Follow `code-style.md` during creation of styles. React Native has no CSS: styles are objects.

### Where styles live

-   Static styles go in `StyleSheet.create` in a co-located `<component-name>.styles.ts` (legacy files use
    `styles.ts`; keep that name when editing them).
-   One default-exported `StyleSheet` per component file. Shared look-and-feel (typography, containers, header
    options) belongs in `app/theme/theme.ts`, not copied between `*.styles.ts` files.

```ts
// workout-card.styles.ts
import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
})
```

### Colors and theme

-   Never hardcode a hex/rgb color in a component or `*.styles.ts`. Colors come from the active palette
    (`useSettings().colors` today, the settings store after the Zustand migration) or `colorsFixed` for
    theme-independent values.
-   Every color must work in **light and dark** themes. Add a new token to both `colorsLight` and `colorsDark` in
    `app/theme/colors.ts` rather than picking a one-off color.
-   Typography (sizes, weights) comes from `theme.text.*` or the text wrappers in `app/theme/parents.tsx`.

### Static vs dynamic styles

Inline style objects are allowed **only** for values known at runtime (theme colors, safe-area insets, props,
measured sizes). Compose them with the static style in an array:

```tsx
<View style={[styles.container, { backgroundColor: colors.background, paddingBottom: footer }]} />
```

Not allowed — static values inline (move them into the StyleSheet or a variant style):

```tsx
<View style={{ marginTop: 0, width: '90%', paddingVertical: 0 }} />
```

For a fixed set of variants, define one style per variant in the StyleSheet and pick it by key
(`styles[variant]`), instead of building objects with ternaries.

### Layout and sizes

-   No magic numbers: spacing/sizes reused across components come from `appScreen` / theme constants; component-only
    values go into the component's `*.constants.ts` or StyleSheet with a clear name.
-   Respect safe areas through `app/theme/insets.ts` (`useAppInsets`), not hardcoded paddings for notches or the
    navigation bar.
-   Platform differences via `Platform.select` inside the StyleSheet, not scattered `Platform.OS` checks in JSX.
-   Animations: Reanimated 4 (`useAnimatedStyle`) for anything per-frame; `LayoutAnimation` only for simple list
    changes.
