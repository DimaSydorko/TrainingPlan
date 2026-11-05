/**
 * Smoke test: the whole app tree (query client, settings gate, gesture root, AppHelperProvider, navigation)
 * renders and reaches the login screen when nobody is signed in.
 */
import { render, screen } from '@testing-library/react-native'
import { useNetworkStore } from '@stores/network/use-network-store'
import App from '../app'

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
