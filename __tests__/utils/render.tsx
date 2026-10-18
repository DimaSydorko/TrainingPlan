/**
 * `renderWithStore(ui, { store, preloadedState })` renders inside a redux Provider and returns the
 * RNTL result plus the store. Use it for components that call the hooks in app/hooks/redux.ts.
 */
import * as React from 'react'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react-native'
import type { RootState } from '../../app/store'
import { createTestStore, TestStore } from './test-store'

type Options = { store?: TestStore; preloadedState?: Parameters<typeof createTestStore>[0] }

export async function renderWithStore(ui: React.ReactElement, { store, preloadedState }: Options = {}) {
  const testStore = store ?? createTestStore(preloadedState)
  const Wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={testStore}>{children}</Provider>
  const result = await render(ui, { wrapper: Wrapper })
  return { ...result, store: testStore, getState: () => testStore.getState() as RootState }
}
