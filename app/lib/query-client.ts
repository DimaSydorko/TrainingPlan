import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { MutationCache, QueryCache, QueryClient, onlineManager, focusManager } from '@tanstack/react-query'
import { AppState } from 'react-native'

const TWENTY_FOUR_HOURS = 24 * 60 * 60_000

onlineManager.setEventListener(setOnline => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected)
  })
  return unsubscribe
})

focusManager.setEventListener(setFocused => {
  const subscription = AppState.addEventListener('change', state => {
    setFocused(state === 'active')
  })
  return () => subscription.remove()
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TWENTY_FOUR_HOURS,
      networkMode: 'offlineFirst',
      retry: 2,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
  queryCache: new QueryCache({
    onError: (_error, query) => {
      if (query.state.data !== undefined) {
        // Background refetch error — already have cached data, suppress
        return
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: _error => {
      // Global mutation error handling — screens may override with their own onError
    },
  }),
})

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'rq-cache',
})
