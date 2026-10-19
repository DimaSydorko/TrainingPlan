type ResettableStore = {
  getState: () => { reset: () => void }
}

export const USER_SCOPED_STORES: ResettableStore[] = []

export const resetStores = () => USER_SCOPED_STORES.forEach(store => store.getState().reset())
