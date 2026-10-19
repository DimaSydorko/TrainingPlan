/**
 * Smoke test: the whole app tree (redux Provider, PersistGate, gesture root, AppHelperProvider,
 * navigation) renders with a mock store and reaches the login screen when nobody is signed in.
 */
import { render, screen } from '@testing-library/react-native'
import { useNetworkStore } from '@stores/network/use-network-store'
import App from '../app'

jest.mock('@store', () => {
  const { createTestStore, createBootstrappedPersistor } = require('./utils/test-store')
  const store = createTestStore()
  return { __esModule: true, store, persistedStore: createBootstrappedPersistor(), setupStore: createTestStore }
})

describe('App', () => {
  it('renders the login screen for a signed-out user', async () => {
    useNetworkStore.setState({ isOnline: true })
    await render(<App />)

    expect(await screen.findByPlaceholderText('E-mail')).toBeOnTheScreen()
    expect(screen.getByPlaceholderText('Password')).toBeOnTheScreen()
    expect(screen.getByText('Log in')).toBeOnTheScreen()
    expect(screen.getByText('Sign up')).toBeOnTheScreen()
    // testIDs used by the Maestro flows (e2e/subflows/login.yaml)
    expect(screen.getByTestId('login.email')).toBeOnTheScreen()
    expect(screen.getByTestId('login.password')).toBeOnTheScreen()
    expect(screen.getByTestId('login.submit')).toBeOnTheScreen()
  })
})
