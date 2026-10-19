import { create } from 'zustand'

type NetworkState = {
  isOnline: boolean
  setIsOnline: (isOnline: boolean) => void
  reset: () => void
}

const INITIAL_STATE = {
  isOnline: false,
}

export const useNetworkStore = create<NetworkState>()(set => ({
  ...INITIAL_STATE,
  setIsOnline: isOnline => set({ isOnline }),
  reset: () => set(INITIAL_STATE),
}))

export const useIsOnline = () => useNetworkStore(state => state.isOnline)
