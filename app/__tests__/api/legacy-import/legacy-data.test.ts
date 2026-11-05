import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@lib/supabase/client'
import { parseLegacyData } from '@api/legacy-import/legacy-data'
import { runLegacyImport } from '@api/legacy-import/run-legacy-import'

const workout = (uid: string) => ({ uid, name: uid, colorIdx: 0, labels: [], exercises: [] })

const legacyRoot = (slices: Record<string, unknown>) =>
  JSON.stringify(Object.fromEntries(Object.entries(slices).map(([key, value]) => [key, JSON.stringify(value)])))

describe('parseLegacyData', () => {
  it('reads persisted workouts in the user order and plans', () => {
    const raw = legacyRoot({
      workoutReducer: { workouts: [workout('a'), workout('b')], sortedWorkoutUids: ['b', 'a'] },
      plansReducer: { plans: [{ uid: 'p1', workouts: [] }] },
    })

    const data = parseLegacyData(raw)
    expect(data.workouts.map(item => item.uid)).toEqual(['b', 'a'])
    expect(data.plans.map(item => item.uid)).toEqual(['p1'])
  })

  it.each([
    ['nothing persisted', null],
    ['broken JSON', '{'],
    ['no slices', JSON.stringify({})],
  ])('returns empty data for %s', (_label, raw) => {
    expect(parseLegacyData(raw)).toEqual({ workouts: [], plans: [] })
  })
})

describe('runLegacyImport', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('imports the persisted data of the same user once', async () => {
    await AsyncStorage.setItem(
      'persist:root',
      legacyRoot({ userReducer: { user: { email: 'A@test.com' } }, workoutReducer: { workouts: [workout('a')] } })
    )
    jest.mocked(supabase.rpc).mockResolvedValueOnce({ data: { workouts: 1 }, error: null } as never)

    await expect(runLegacyImport({ sessionEmail: 'a@test.com' })).resolves.toEqual({ workouts: 1 })
    expect(supabase.rpc).toHaveBeenCalledWith('import_legacy_data', { p_payload: expect.any(Object) })
  })

  it('skips another account and an already imported profile', async () => {
    await AsyncStorage.setItem('persist:root', legacyRoot({ userReducer: { user: { email: 'a@test.com' } } }))

    await expect(runLegacyImport({ sessionEmail: 'b@test.com' })).resolves.toBeNull()
    await expect(runLegacyImport({ sessionEmail: 'a@test.com', legacyImportedAt: '2026-11-01' })).resolves.toBeNull()
    expect(supabase.rpc).not.toHaveBeenCalled()
  })
})
