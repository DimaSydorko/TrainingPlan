# A5: UI libraries and navigation

## Mission
Upgrade navigation, animation, gestures, icons, and third-party UI components to versions that work under the New Architecture, and fix any UI broken by React 19 or RN 0.86.

## Branch
`migration/a5-ui` (worktree `../tp-a5-ui`)

## Owns
`app/Routers/**`, `app/Common/**`, `app/Theme/**`, navigation types in `app/Utils/types.ts`, `app/App.tsx`, `app/Components/**` except `AppSoundPicker` (`NotificationHandler` is the in-app toaster and belongs to you), and every `app/Screens/**` folder except `PlayingScreen`, `SettingsScreen` and `LoginScreen/AppGoogleSignInButton.tsx`.

## Tasks
1. **React Navigation 7** (`Routers/*.tsx`, typed navigation in `types.ts`)
   - Follow the official 6→7 upgrade guide. Things to watch: the `navigate` behaviour changes (navigating to a screen in a nested navigator, and the removal of `navigateDeprecated`), `NavigationContainer` theming (the app has its own light/dark themes in `Theme/theme.ts`), and stricter `headerBackTitle` handling.
   - Prefer `@react-navigation/native-stack` over JS `stack` where it doesn't change the look. Write down any you keep on JS `stack` and why.
   - Make sure screen params are typed (`RootStackParamList`) so `tsc` catches broken navigate calls.
2. **Reanimated 4 + worklets**: check the babel plugin setup (A0) and fix any Reanimated 2 APIs that were removed (e.g. old `useAnimatedGestureHandler`). Gesture Handler: wrap the root in `GestureHandlerRootView` (in `App.tsx`).
3. **Icons**: install `@react-native-vector-icons/material-design-icons` and implement `app/Common/Icon/Icon.tsx` with it. Check that every icon name used still exists in the current MaterialCommunityIcons set; update renamed ones. Use the font-loading approach recommended for Expo (config plugin or `useFonts`) so there's no flash of missing icons.
4. **Third-party UI**
   - `react-native-draggable-flatlist` (used in WorkoutsScreen, MyPlansScreen, WorkoutScreen): check it on device with Reanimated 4 and the New Architecture. If it's broken or unmaintained, switch to `react-native-reorderable-list` (or something similar) behind one wrapper component in `Common/DraggableList/` so the three screens use the same API.
   - `react-native-scroll-picker-wheel` (`Common/SwipeSelector`): check it. If it's broken, replace it with a small FlatList snap picker in `SwipeSelector` that keeps the same props.
   - `react-native-countdown-circle-timer`, `react-native-circular-progress`, `react-native-keyboard-aware-scroll-view`, `@react-native-community/slider`: check each. For keyboard handling, consider `react-native-keyboard-controller` only if the existing one misbehaves with edge-to-edge.
   - `react-native-svg` icons in `app/Assets/icons/*.tsx`: just make sure they render.
5. **Edge-to-edge (Android)**: SDK 57 apps are edge-to-edge. Go through every screen to check status bar, nav bar, and safe-area insets (`react-native-safe-area-context`, `useSafeAreaInsets`), especially `TapBar`, modals, and `Toast`.
6. **React 19 fixes**: `SwitchLib.tsx` uses `static defaultProps` on a class, which is still allowed; leave it or convert it to a function component with default parameters. Fix any `ref` forwarding issues (in React 19, `ref` is a regular prop for function components).
7. **Theme**: light and dark switching works, including the navigation theme, status bar style, and the system UI colours.

## Acceptance criteria
- [ ] Every route can be reached; back navigation, deep nested navigation, and tab switching work on both platforms.
- [ ] Drag-to-reorder works on all 3 list screens and saves the order (uses A1's thunks, which should be unaffected).
- [ ] Every icon renders, with no "?" glyphs.
- [ ] No content hidden under the system bars on Android 15+ or iOS devices with a notch.
- [ ] Light and dark themes are correct on every screen.
- [ ] `tsc`, lint, and tests all pass.

## Handoff
Fill in `handoff/A5.md`: library replacements, renamed icons, navigator choices, and any navigation param changes that affect A4's PlayingScreen.
