import '@i18n'
import * as React from 'react'
import { ReactNode, useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { decode, encode } from 'base-64'
import AppHelperProvider from '@hooks/app-helper-provider'
import { useAppTheme } from '@theme/use-app-theme'
import { useSettingsHydrated } from '@stores/settings/use-settings-hydrated'
import AuthRouter from '@routers/auth-router'
import { statusBarStyleFor } from '@theme/navigation-theme'
import { asyncStoragePersister, queryClient } from '@lib/query-client'
import { registerWorkoutsMutationDefaults } from '@services/workouts/mutation-defaults'
import { registerPlansMutationDefaults } from '@services/plans/mutation-defaults'
import { registerSessionsMutationDefaults } from '@services/sessions/mutation-defaults'
import { registerProfilesMutationDefaults } from '@services/profiles/mutation-defaults'
import styles from './app.styles'

registerWorkoutsMutationDefaults(queryClient)
registerPlansMutationDefaults(queryClient)
registerSessionsMutationDefaults(queryClient)
registerProfilesMutationDefaults(queryClient)

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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
      onSuccess={() => queryClient.resumePausedMutations()}
    >
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
    </PersistQueryClientProvider>
  )
}

export default App
