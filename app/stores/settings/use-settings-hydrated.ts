import { useSyncExternalStore } from 'react'
import { useSettingsStore } from './use-settings-store'

const subscribeToHydration = (onChange: () => void) => {
  const unsubscribeStart = useSettingsStore.persist.onHydrate(onChange)
  const unsubscribeFinish = useSettingsStore.persist.onFinishHydration(onChange)

  return () => {
    unsubscribeStart()
    unsubscribeFinish()
  }
}

const getIsHydrated = () => useSettingsStore.persist.hasHydrated()

export const useSettingsHydrated = () => useSyncExternalStore(subscribeToHydration, getIsHydrated, getIsHydrated)
