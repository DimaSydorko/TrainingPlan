/**
 * Runs after the test framework is installed (jest `setupFilesAfterEnv`).
 * RNTL 14 registers its matchers (toBeOnTheScreen, toHaveTextContent, ...) on import, so nothing to
 * add for them here.
 */

// Reanimated 4: deterministic animation timers and matchers such as toHaveAnimatedStyle.
require('react-native-reanimated').setUpTests()

// Initializes i18next once for every test file, as app.tsx does for the app.
require('@i18n')
