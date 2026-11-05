import { supabase } from '@lib/supabase/client'
import { completeOnboarding } from '@api/profiles/complete-onboarding'

const profileRow = {
  id: 'u1',
  display_name: 'Dmytro',
  email: 'a@test.com',
  photo_url: null,
  legacy_imported_at: null,
  sex: 'male',
  training_experience: '1_3y',
  overall_level: 'intermediate',
  onboarded_at: '2026-11-05T10:00:00.000Z',
}

const mockTable = (result: unknown) => {
  const query: Record<string, jest.Mock> & { then?: unknown } = {}
  ;['update', 'upsert', 'eq', 'select'].forEach(method => {
    query[method] = jest.fn(() => query)
  })
  query.single = jest.fn(async () => result)
  query.then = (onFulfilled: (value: unknown) => unknown) => Promise.resolve(result).then(onFulfilled)
  jest.mocked(supabase.from).mockReturnValueOnce(query as never)
  return query
}

describe('completeOnboarding', () => {
  it('saves the body weight and the answers and returns the profile', async () => {
    const weights = mockTable({ error: null })
    const profiles = mockTable({ data: profileRow, error: null })

    await expect(
      completeOnboarding({
        userId: 'u1',
        sex: 'male',
        trainingExperience: '1_3y',
        bodyWeightKg: 80.5,
        onboardedAt: profileRow.onboarded_at,
      })
    ).resolves.toMatchObject({ sex: 'male', trainingExperience: '1_3y', overallLevel: 'intermediate' })

    expect(supabase.from).toHaveBeenNthCalledWith(1, 'body_weights')
    expect(weights.upsert).toHaveBeenCalledWith(
      { user_id: 'u1', weight_kg: 80.5 },
      { onConflict: 'user_id,measured_on' }
    )
    expect(supabase.from).toHaveBeenNthCalledWith(2, 'profiles')
    expect(profiles.update).toHaveBeenCalledWith({
      sex: 'male',
      training_experience: '1_3y',
      onboarded_at: profileRow.onboarded_at,
    })
    expect(profiles.eq).toHaveBeenCalledWith('id', 'u1')
  })

  it('only marks onboarding done when everything was skipped', async () => {
    const profiles = mockTable({ data: { ...profileRow, sex: null, training_experience: null }, error: null })

    await completeOnboarding({ userId: 'u1', onboardedAt: profileRow.onboarded_at })

    expect(supabase.from).toHaveBeenCalledTimes(1)
    expect(profiles.update).toHaveBeenCalledWith({ onboarded_at: profileRow.onboarded_at })
  })

  it('throws the Supabase error', async () => {
    const error = new Error('rls')
    mockTable({ error })

    await expect(completeOnboarding({ userId: 'u1', bodyWeightKg: 80, onboardedAt: 'x' })).rejects.toBe(error)
  })
})
