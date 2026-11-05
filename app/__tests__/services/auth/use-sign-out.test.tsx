import * as React from 'react'
import { act, renderHook } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import { asyncStoragePersister } from '@lib/query-client'
import useSignOut from '@services/auth/use-sign-out'

describe('useSignOut', () => {
  it('signs out locally, runs the cleanup and clears the query cache', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['profiles', 'detail', 'u1'], { id: 'u1' })
    const removeClient = jest.spyOn(asyncStoragePersister, 'removeClient')
    const onSignedOut = jest.fn()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = await renderHook(() => useSignOut({ onSignedOut }), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(onSignedOut).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData(['profiles', 'detail', 'u1'])).toBeUndefined()
    expect(removeClient).toHaveBeenCalled()
  })
})
