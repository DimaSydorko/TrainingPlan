import { supabase } from '@lib/supabase/client'
import { getProfile } from '@api/profiles/get-profile'
import { toProfile } from '@api/profiles/mappers'

const row = {
  id: 'u1',
  display_name: 'Dmytro',
  email: 'a@test.com',
  photo_url: null,
  legacy_imported_at: null,
  sex: null,
  training_experience: null,
  overall_level: null,
  onboarded_at: null,
}

describe('toProfile', () => {
  it('maps a row and turns nulls into undefined', () => {
    expect(toProfile(row)).toEqual({
      id: 'u1',
      displayName: 'Dmytro',
      email: 'a@test.com',
      photoUrl: undefined,
      legacyImportedAt: undefined,
    })
  })

  it('keeps the photo and import date', () => {
    expect(
      toProfile({ ...row, photo_url: 'https://example.com/a.png', legacy_imported_at: '2026-11-01T10:00:00Z' })
    ).toMatchObject({ photoUrl: 'https://example.com/a.png', legacyImportedAt: '2026-11-01T10:00:00Z' })
  })
})

describe('getProfile', () => {
  const mockQuery = (result: unknown) => {
    const query = { select: jest.fn(), eq: jest.fn(), single: jest.fn(async () => result) }
    query.select.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    jest.mocked(supabase.from).mockReturnValueOnce(query as never)
    return query
  }

  it('selects the profile of the given user', async () => {
    const query = mockQuery({ data: row, error: null })

    await expect(getProfile('u1')).resolves.toMatchObject({ id: 'u1', displayName: 'Dmytro' })
    expect(supabase.from).toHaveBeenCalledWith('profiles')
    expect(query.eq).toHaveBeenCalledWith('id', 'u1')
  })

  it('throws the Supabase error', async () => {
    const error = new Error('denied')
    mockQuery({ data: null, error })

    await expect(getProfile('u1')).rejects.toBe(error)
  })
})
