// firebase/auth's package.json lists the browser `types` before the `react-native` condition, so
// TypeScript never sees the React Native build's extra export. Metro does load the RN build
// (@firebase/auth/dist/rn) at runtime, where getReactNativePersistence exists.
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth'

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence
}
