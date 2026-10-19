## Styles

Follow `code-style.md` during creation of styles. React Native has no CSS: styles are objects.

### Where styles live

-   Static styles go in `StyleSheet.create` in a co-located `<component-name>.styles.ts` (legacy files use
    `styles.ts`; keep that name when editing them).
-   One default-exported `StyleSheet` per component file. Never copy shared look-and-feel between `*.styles.ts`:
    use the primitives below or `@theme/tokens`.

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

-   Never hardcode a hex/rgb color in a component or `*.styles.ts`. Colors come from the semantic roles of the
    active theme (`useThemeColors()` / `useAppTheme().colors` from `app/theme/use-app-theme.ts`); theme-independent
    roles (`shadow`, `onPrimary`, `staticWhite`, `staticBlack`) are part of the same object.
-   Every color must work in **light and dark** themes. Raw values live only in `app/theme/tokens/palette.ts`; add a
    role to `ThemeColors`, `lightColors` and `darkColors` in `app/theme/themes.ts` rather than picking a one-off
    color. Exercise/plan colors: `getExerciseColor(colorIdx, isDark)` from `@theme/tokens`.
-   Text: `<AppText variant tone align>` (`@common/app-text/app-text`); raw sizes: `typography` in `@theme/tokens`.
-   Layout: `Stack` (`preset`/`direction`/`align`/`justify`/`gap`), `Screen`, `Card`, `Divider`, `AppHeader`,
    `AppFooter` in `app/common`. Shadows: `shadow` token; stack header: `useScreenOptions` (`@theme/navigation-theme`).

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

-   Spacing, radius and font sizes come from `spacing`, `radius`, `fontSize` / `typography` in `@theme/tokens` when
    the value is on the scale.
-   No magic numbers: spacing/sizes reused across components come from theme constants (`BAR_HEIGHT`,
    `LAYOUT_GUTTER` in `app/theme/*.constants.ts`); component-only values go into the component's `*.constants.ts`
    or StyleSheet with a clear name.
-   Window sizes: never `Dimensions.get` or sizes measured at module load. Prefer flex / `'100%'` / margins; when a
    real size is needed use `useScreen()` from `app/platform/screen.ts` (`width`, `height`, `breakpoint`:
    compact < 600 ≤ medium < 840 ≤ expanded) and compose it as a runtime style (`[styles.x, { width }]`).
-   Respect safe areas through `app/theme/insets.ts` (`useAppInsets`), not hardcoded paddings for notches or the
    navigation bar.
-   Platform differences via `Platform.select` inside the StyleSheet, not scattered `Platform.OS` checks in JSX.
-   Animations: Reanimated 4 (`useAnimatedStyle`) for anything per-frame; `LayoutAnimation` only for simple list
    changes.
