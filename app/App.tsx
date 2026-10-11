import * as React from 'react'
import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { PersistGate } from 'redux-persist/integration/react'
import { decode, encode } from 'base-64'
import { persistedStore, store } from './store'
import AppHelperProvider from './Hooks/AppHelperProvider'
import { useSettings } from './Hooks/redux'
import AuthRouter from './Routers/AuthRouter'
import { statusBarStyleFor } from './Theme/navigationTheme'

if (!globalThis.btoa) globalThis.btoa = encode
if (!globalThis.atob) globalThis.atob = decode

/** Applies the app palette (chosen in Settings, not the system theme) to the root view and system UI. */
function ThemedRoot({ children }: { children: ReactNode }) {
  const { colors } = useSettings()

  useEffect(() => {
    // Root view colour shows behind screens during transitions and around the keyboard
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => null)
  }, [colors.background])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={statusBarStyleFor(colors)} />
      {children}
    </GestureHandlerRootView>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <ThemedRoot>
              <AppHelperProvider>
                <AuthRouter />
              </AppHelperProvider>
            </ThemedRoot>
          </KeyboardProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
