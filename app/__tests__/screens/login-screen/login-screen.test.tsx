import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthApiError } from '@supabase/supabase-js'
import { supabase } from '@lib/supabase/client'
import { useNetworkStore } from '@stores/network/use-network-store'
import LoginScreen from '@screens/login-screen/login-screen'

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}))

const renderLogin = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginScreen />
    </QueryClientProvider>
  )
}

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useNetworkStore.setState({ isOnline: true })
  })

  it('signs in with the typed e-mail and password', async () => {
    await renderLogin()

    await fireEvent.changeText(screen.getByTestId('login.email'), 'a@test.com')
    await fireEvent.changeText(screen.getByTestId('login.password'), 'secret12')
    await fireEvent.press(screen.getByTestId('login.submit'))

    await waitFor(() =>
      expect(jest.mocked(supabase.auth.signInWithPassword)).toHaveBeenCalledWith({
        email: 'a@test.com',
        password: 'secret12',
      })
    )
  })

  it('shows a readable message for wrong credentials', async () => {
    jest.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    } as never)
    await renderLogin()

    await fireEvent.press(screen.getByTestId('login.submit'))

    expect(await screen.findByText('Wrong e-mail or password.')).toBeOnTheScreen()
  })
})
