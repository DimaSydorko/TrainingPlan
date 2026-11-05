import * as React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import { registerSessionsMutationDefaults } from '@services/sessions/mutation-defaults'
import useFinishSession from '@services/sessions/use-finish-session'

describe('useFinishSession', () => {
  it('runs finish_session through the registered mutation defaults', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } })
    registerSessionsMutationDefaults(queryClient)
    jest
      .mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: { session_id: 's1', inserted: true, records: [] }, error: null } as never)
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = await renderHook(() => useFinishSession(), { wrapper })

    await act(async () => {
      result.current.mutate({
        session: { id: 's1', workoutName: 'Push', startedAt: 'a', finishedAt: 'b' },
        sets: [],
      })
    })

    await waitFor(() => expect(result.current.data?.sessionId).toBe('s1'))
    expect(supabase.rpc).toHaveBeenCalledWith('finish_session', expect.any(Object))
    queryClient.clear()
  })
})
