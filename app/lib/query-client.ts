import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { MutationCache, QueryCache, QueryClient, onlineManager, focusManager } from '@tanstack/react-query'
import { AppState } from 'react-native'
import { useToastStore } from '@stores/toast/use-toast-store'

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
    onError: (error, query) => {
      if (query.state.data === undefined) useToastStore.getState().showError(error.message)
    },
  }),
  mutationCache: new MutationCache({
    onError: error => useToastStore.getState().showError(error.message),
  }),
})

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'rq-cache',
})
