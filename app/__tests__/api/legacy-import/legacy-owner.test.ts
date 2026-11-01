import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLegacyOwnerEmail, parseLegacyOwnerEmail, shouldImportLegacyData } from '@api/legacy-import/legacy-owner'

const legacyRoot = (userSlice: unknown) => JSON.stringify({ userReducer: JSON.stringify(userSlice) })

describe('parseLegacyOwnerEmail', () => {
  it('reads the normalized e-mail of the persisted Firebase user', () => {
    expect(parseLegacyOwnerEmail(legacyRoot({ user: { uid: 'f1', email: ' Dmytro@Test.com ' } }))).toBe(
      'dmytro@test.com'
    )
  })

  it.each([
    ['nothing persisted', null],
    ['no user slice', JSON.stringify({ settingsReducer: '{}' })],
    ['signed-out user', legacyRoot({ user: null })],
    ['broken JSON', '{'],
  ])('returns null for %s', (_label, raw) => {
    expect(parseLegacyOwnerEmail(raw)).toBeNull()
  })
})

describe('getLegacyOwnerEmail', () => {
  it('reads persist:root from AsyncStorage', async () => {
    await AsyncStorage.setItem('persist:root', legacyRoot({ user: { email: 'a@test.com' } }))

    await expect(getLegacyOwnerEmail()).resolves.toBe('a@test.com')
  })
})

describe('shouldImportLegacyData', () => {
  it('imports when the Supabase user has the same e-mail as the old Firebase user', () => {
    expect(shouldImportLegacyData({ legacyOwnerEmail: 'a@test.com', sessionEmail: 'A@test.com' })).toBe(true)
  })

  it('skips when another account signs in on the same phone', () => {
    expect(shouldImportLegacyData({ legacyOwnerEmail: 'a@test.com', sessionEmail: 'b@test.com' })).toBe(false)
  })

  it('skips when there is no old user', () => {
    expect(shouldImportLegacyData({ legacyOwnerEmail: null, sessionEmail: 'a@test.com' })).toBe(false)
  })

  it('skips when the import already ran', () => {
    expect(
      shouldImportLegacyData({
        legacyOwnerEmail: 'a@test.com',
        sessionEmail: 'a@test.com',
        legacyImportedAt: '2026-11-01T10:00:00Z',
      })
    ).toBe(false)
  })
})
