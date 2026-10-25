import { THEME_MODE } from '@theme/themes.constants'
import { resetStores, USER_SCOPED_STORES } from '@stores/reset-stores'
import { useNetworkStore } from '@stores/network/use-network-store'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../utils/reset-test-stores'

describe('resetStores', () => {
  beforeEach(resetTestStores)

  it('resets every user-scoped store', () => {
    const reset = jest.fn()

    USER_SCOPED_STORES.push({ getState: () => ({ reset }) })
    resetStores()
    USER_SCOPED_STORES.pop()

    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('keeps device settings and connectivity across logout', () => {
    useSettingsStore.getState().setThemeMode(THEME_MODE.DARK)
    useSettingsStore.getState().toggleVibration()
    useNetworkStore.getState().setIsOnline(true)

    resetStores()

    expect(useSettingsStore.getState().themeMode).toBe(THEME_MODE.DARK)
    expect(useSettingsStore.getState().isVibration).toBe(false)
    expect(useNetworkStore.getState().isOnline).toBe(true)
  })
})
