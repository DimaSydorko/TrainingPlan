import * as React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import { registerProfilesMutationDefaults } from '@services/profiles/mutation-defaults'
import { profilesKeys } from '@services/profiles/query-keys'
import useCompleteOnboarding from '@services/profiles/use-complete-onboarding'
import type { Profile } from '@services/profiles/types'

describe('useCompleteOnboarding', () => {
  it('marks the cached profile onboarded at once and rolls back on error', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, staleTime: Infinity }, mutations: { gcTime: Infinity } },
    })
    registerProfilesMutationDefaults(queryClient)
    const profile: Profile = { id: 'u1', displayName: 'D', email: 'a@test.com' }
    queryClient.setQueryData(profilesKeys.detail('u1'), profile)
    const query = { update: jest.fn(), eq: jest.fn(), select: jest.fn(), single: jest.fn() }
    query.update.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    query.select.mockReturnValue(query)
    let resolveSave: (value: unknown) => void = () => undefined
    query.single.mockReturnValue(new Promise(resolve => (resolveSave = resolve)))
    jest.mocked(supabase.from).mockReturnValue(query as never)
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = await renderHook(() => useCompleteOnboarding(), { wrapper })

    await act(async () => {
      result.current.completeOnboarding('u1', { sex: 'female' })
    })
    expect(queryClient.getQueryData<Profile>(profilesKeys.detail('u1'))).toMatchObject({ sex: 'female' })
    expect(queryClient.getQueryData<Profile>(profilesKeys.detail('u1'))?.onboardedAt).toBeDefined()

    await act(async () => resolveSave({ data: null, error: new Error('rls') }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData<Profile>(profilesKeys.detail('u1'))?.onboardedAt).toBeUndefined()
    jest.mocked(supabase.from).mockReset()
    queryClient.clear()
  })
})
