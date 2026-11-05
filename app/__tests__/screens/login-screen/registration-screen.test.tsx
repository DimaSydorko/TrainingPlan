import { fireEvent, render, screen } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthApiError } from '@supabase/supabase-js'
import { supabase } from '@lib/supabase/client'
import { useNetworkStore } from '@stores/network/use-network-store'
import RegistrationScreen from '@screens/login-screen/registration-screen'

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ popTo: jest.fn() }),
}))

const renderRegistration = async () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  await render(
    <QueryClientProvider client={queryClient}>
      <RegistrationScreen />
    </QueryClientProvider>
  )
  await fireEvent.changeText(screen.getByPlaceholderText('Full Name'), 'Dmytro')
  await fireEvent.changeText(screen.getByPlaceholderText('E-mail'), 'a@test.com')
  await fireEvent.changeText(screen.getByPlaceholderText('Password'), 'secret12')
  await fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), 'secret12')
  await fireEvent.press(screen.getByText('Create account'))
}

describe('RegistrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useNetworkStore.setState({ isOnline: true })
  })

  it('signs up with the full name and asks to confirm the e-mail', async () => {
    await renderRegistration()

    expect(await screen.findByText('Account created. Confirm your e-mail, then log in.')).toBeOnTheScreen()
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@test.com',
      password: 'secret12',
      options: { data: { full_name: 'Dmytro' } },
    })
  })

  it('shows a readable message when the e-mail is taken', async () => {
    jest.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthApiError('User already registered', 422, 'user_already_exists'),
    } as never)

    await renderRegistration()

    expect(await screen.findByText('An account with this e-mail already exists.')).toBeOnTheScreen()
  })
})
