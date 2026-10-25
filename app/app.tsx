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
import { persistedStore, store } from '@store'
import AppHelperProvider from '@hooks/app-helper-provider'
import { useAppTheme } from '@theme/use-app-theme'
import { useSettingsHydrated } from '@stores/settings/use-settings-hydrated'
import AuthRouter from '@routers/auth-router'
import { statusBarStyleFor } from '@theme/navigation-theme'
import styles from './app.styles'

if (!globalThis.btoa) globalThis.btoa = encode
if (!globalThis.atob) globalThis.atob = decode

function SettingsGate({ children }: { children: ReactNode }) {
  const isSettingsHydrated = useSettingsHydrated()

  return isSettingsHydrated ? children : null
}

function ThemedRoot({ children }: { children: ReactNode }) {
  const appTheme = useAppTheme()
  const { colors } = appTheme

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => null)
  }, [colors.background])

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={statusBarStyleFor(appTheme)} />
      {children}
    </GestureHandlerRootView>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <SettingsGate>
          <SafeAreaProvider>
            <KeyboardProvider>
              <ThemedRoot>
                <AppHelperProvider>
                  <AuthRouter />
                </AppHelperProvider>
              </ThemedRoot>
            </KeyboardProvider>
          </SafeAreaProvider>
        </SettingsGate>
      </PersistGate>
    </Provider>
  )
}

export default App
