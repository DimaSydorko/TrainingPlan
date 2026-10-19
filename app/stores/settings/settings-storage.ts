import AsyncStorage from '@react-native-async-storage/async-storage'
import type { StateStorage } from 'zustand/middleware'
import { parseLegacySettings } from './legacy-settings'
import { LEGACY_PERSIST_KEY, SETTINGS_STORE_VERSION } from './settings.constants'

const getItemWithLegacyHandover = async (name: string): Promise<string | null> => {
  const [[, storedSettings], [, rawLegacyRoot]] = await AsyncStorage.multiGet([name, LEGACY_PERSIST_KEY])

  if (storedSettings !== null) return storedSettings

  const legacySettings = parseLegacySettings(rawLegacyRoot)

  if (!legacySettings) return null

  const importedSettings = JSON.stringify({ state: legacySettings, version: SETTINGS_STORE_VERSION })

  await AsyncStorage.setItem(name, importedSettings)

  return importedSettings
}

export const settingsStorage: StateStorage = {
  getItem: getItemWithLegacyHandover,
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: name => AsyncStorage.removeItem(name),
}
