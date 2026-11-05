import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNetworkStore } from '@stores/network/use-network-store'
import { USER_SCOPED_STORES } from '@stores/reset-stores'
import { useSessionStore } from '@stores/session/use-session-store'
import ProfileScreen from '@screens/profile-screen/profile-screen'

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}))

describe('ProfileScreen logout', () => {
  it('clears cached server data and user stores after signing out', async () => {
    useNetworkStore.setState({ isOnline: true })
    useSessionStore.setState({ userId: 'u1', email: 'a@test.com' })
    const resetUserStore = jest.fn()
    USER_SCOPED_STORES.push({ getState: () => ({ reset: resetUserStore }) })
    const queryClient = new QueryClient()
    queryClient.setQueryData(['plans', 'list', 'u1'], [{ uid: 'p1' }])

    await render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>
    )
    await fireEvent.press(screen.getByTestId('profile.logout'))
    await fireEvent.press(screen.getByTestId('appModal.confirm'))

    await waitFor(() => expect(queryClient.getQueryData(['plans', 'list', 'u1'])).toBeUndefined())
    expect(resetUserStore).toHaveBeenCalled()
    USER_SCOPED_STORES.pop()
  })
})
