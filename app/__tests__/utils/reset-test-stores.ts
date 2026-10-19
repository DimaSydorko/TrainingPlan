import { useNetworkStore } from '@stores/network/use-network-store'
import { DEFAULT_SETTINGS } from '@stores/settings/settings.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'

export const resetTestStores = () => {
  useSettingsStore.setState(DEFAULT_SETTINGS)
  useNetworkStore.getState().reset()
}
