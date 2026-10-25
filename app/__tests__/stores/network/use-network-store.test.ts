import { useNetworkStore } from '@stores/network/use-network-store'
import { resetTestStores } from '../../utils/reset-test-stores'

describe('useNetworkStore', () => {
  beforeEach(resetTestStores)

  it('starts offline until the connection is reported', () => {
    expect(useNetworkStore.getState().isOnline).toBe(false)
  })

  it('tracks the reported connection and resets', () => {
    useNetworkStore.getState().setIsOnline(true)

    expect(useNetworkStore.getState().isOnline).toBe(true)

    useNetworkStore.getState().reset()

    expect(useNetworkStore.getState().isOnline).toBe(false)
  })
})
