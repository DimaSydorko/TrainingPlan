import { create } from 'zustand'

type ToastState = {
  errorMessage: string
  showError: (message: string) => void
  clearError: () => void
  reset: () => void
}

const INITIAL_STATE = {
  errorMessage: '',
}

export const useToastStore = create<ToastState>()(set => ({
  ...INITIAL_STATE,
  showError: errorMessage => set({ errorMessage }),
  clearError: () => set(INITIAL_STATE),
  reset: () => set(INITIAL_STATE),
}))
