import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, renderHook } from '@testing-library/react-native'
import { useSettingsHydrated } from '@stores/settings/use-settings-hydrated'
import { useSettingsStore } from '@stores/settings/use-settings-store'

type StoredPairs = Awaited<ReturnType<typeof AsyncStorage.multiGet>>

describe('useSettingsHydrated', () => {
  it('is false while the settings rehydrate and true once they finished', async () => {
    let releaseStorage: (pairs: StoredPairs) => void = () => undefined

    jest
      .mocked(AsyncStorage.multiGet)
      .mockImplementationOnce(() => new Promise<StoredPairs>(resolve => (releaseStorage = resolve)))
    const { result } = await renderHook(() => useSettingsHydrated())
    let pendingHydration: ReturnType<typeof useSettingsStore.persist.rehydrate> | undefined

    await act(() => {
      pendingHydration = useSettingsStore.persist.rehydrate()
    })

    expect(result.current).toBe(false)

    await act(async () => {
      releaseStorage([
        ['settings-v1', null],
        ['persist:root', null],
      ])
      await pendingHydration
    })

    expect(result.current).toBe(true)
  })
})
