import reducer, { changePlansPosition, clearPlaneResults, selectPlan } from '@store/plans-reducer/plans-slice'
import { plansAC } from '@store/plans-reducer/plans-ac'

jest.mock('@utils/firebase', () => ({
  db: {},
  auth: {},
  rtdb: {},
  plansCollection: { path: 'plans' },
  workoutsCollection: { path: 'workouts' },
  usersDataCollection: { path: 'usersData' },
}))
jest.mock('firebase/firestore', () => {
  const batch = { set: jest.fn(), delete: jest.fn(), commit: jest.fn(() => Promise.resolve()) }
  return {
    __batch: batch,
    doc: jest.fn((col, id) => ({ path: `${col.path}/${id}` })),
    getDocs: jest.fn(),
    setDoc: jest.fn(() => Promise.resolve()),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    query: jest.fn((col, ...constraints) => ({ col, constraints })),
    where: jest.fn((...args) => ({ where: args })),
    limit: jest.fn(n => ({ limit: n })),
    writeBatch: jest.fn(() => batch),
  }
})
jest.mock('firebase/database', () => ({ get: jest.fn(), ref: jest.fn() }))
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn() }))

const NetInfo = jest.requireMock('@react-native-community/netinfo')
const firestore = jest.requireMock('firebase/firestore')

const plan = (uid: string, lastUpdated = 1, extra = {}) => ({
  uid,
  colorIdx: 0,
  ownerUid: 'u1',
  name: `plan ${uid}`,
  workouts: [],
  labels: [],
  lastUpdated,
  ...extra,
})
const initial = () => reducer(undefined, { type: '@@init' })
const rootState = (plansReducer = {}) => ({
  userReducer: { user: { uid: 'u1' } },
  plansReducer: { ...initial(), ...plansReducer },
})
const run = async (thunk, state) => {
  const dispatch = jest.fn()
  const action = await thunk(dispatch, () => state, undefined)
  return { action, dispatch }
}
const online = (isConnected: boolean) => NetInfo.fetch.mockResolvedValue({ isConnected })

beforeEach(() => jest.clearAllMocks())

describe('PlansSlice reducers', () => {
  it('selects, sorts and clears', () => {
    let s = reducer(initial(), selectPlan(plan('a')))
    s = reducer(s, changePlansPosition(['b', 'a']))
    expect(s.selectedPlan.uid).toBe('a')
    expect(s.sortedPlanUids).toEqual(['b', 'a'])
    expect(reducer(s, clearPlaneResults())).toEqual(initial())
  })

  it('getPlans.fulfilled replaces plans and clears pending deletes only when online', () => {
    const start = { ...initial(), plans: [plan('old')], deletedPlanUids: ['x'] }
    const offline = reducer(start, plansAC.getPlans.fulfilled({ plans: [], isInternet: false }, 'r'))
    expect(offline.plans).toEqual([plan('old')])
    expect(offline.deletedPlanUids).toEqual(['x'])
    const on = reducer(start, plansAC.getPlans.fulfilled({ plans: [plan('n')], isInternet: true }, 'r'))
    expect(on.plans).toEqual([plan('n')])
    expect(on.deletedPlanUids).toEqual([])
  })

  it('deletePlan.fulfilled removes the plan and remembers offline deletes', () => {
    const start = { ...initial(), plans: [plan('a'), plan('b')] }
    const s = reducer(start, plansAC.deletePlan.fulfilled({ planUid: 'a', isInternet: false }, 'r', 'a'))
    expect(s.plans.map(p => p.uid)).toEqual(['b'])
    expect(s.deletedPlanUids).toEqual(['a'])
  })

  it('updatePlan.fulfilled updates the list and the selected plan, and works with no selection', () => {
    const start = { ...initial(), plans: [plan('a')], selectedPlan: plan('a') }
    const s = reducer(start, plansAC.updatePlan.fulfilled(plan('a', 2, { name: 'new' }), 'r', plan('a')))
    expect(s.plans[0].name).toBe('new')
    expect(s.selectedPlan.name).toBe('new')
    expect(() =>
      reducer({ ...start, selectedPlan: null }, plansAC.updatePlan.fulfilled(plan('a'), 'r', plan('a')))
    ).not.toThrow()
  })

  it('rejected actions set a prefixed error', () => {
    const s = reducer(initial(), plansAC.addPlan.rejected(null, 'r', plan('a'), 'boom'))
    expect(s.error).toBe('Plan boom')
    expect(s.isLoading).toBe(false)
  })
})

describe('plansAC thunks', () => {
  it('getPlans loads remote plans, merges the cache and pushes local changes', async () => {
    online(true)
    firestore.getDocs.mockResolvedValue({
      docs: [
        { id: 'a', data: () => ({ name: 'remote a', lastUpdated: 1, ownerUid: 'u1' }) },
        { id: 'gone', data: () => ({ name: 'deleted offline', lastUpdated: 1, ownerUid: 'u1' }) },
      ],
    })
    const state = rootState({
      plans: [plan('a', 5, { name: 'local a' }), plan('local', 3), plan('foreign', 3, { ownerUid: 'u2' })],
      deletedPlanUids: ['gone'],
    })
    const { action } = await run(plansAC.getPlans(), state)

    expect(firestore.where).toHaveBeenCalledWith('ownerUid', '==', 'u1')
    expect(action.type).toBe('plans/getPlans/fulfilled')
    expect(action.payload.isInternet).toBe(true)
    expect(action.payload.plans.map(p => p.uid)).toEqual(['a', 'local'])
    expect(action.payload.plans[0].name).toBe('local a')

    const batch = firestore.__batch
    expect(batch.set.mock.calls.map(([ref]) => ref.path)).toEqual(['plans/a', 'plans/local'])
    expect(batch.set.mock.calls[0][1]).not.toHaveProperty('uid')
    expect(batch.delete.mock.calls.map(([ref]) => ref.path)).toEqual(['plans/gone'])
    expect(batch.commit).toHaveBeenCalledTimes(1)
  })

  it('getPlans offline does not touch Firestore', async () => {
    online(false)
    const { action } = await run(plansAC.getPlans(), rootState({ plans: [plan('a')] }))
    expect(action.payload).toEqual({ plans: [], isInternet: false })
    expect(firestore.getDocs).not.toHaveBeenCalled()
  })

  it('addPlan writes the document without uid and returns the full plan', async () => {
    online(true)
    const input = Object.freeze({ ...plan(''), uid: '', ownerUid: '' })
    const { action } = await run(plansAC.addPlan(input), rootState())
    const saved = action.payload
    expect(saved.uid).toHaveLength(16)
    expect(saved.ownerUid).toBe('u1')
    expect(saved.lastUpdated).toBeGreaterThan(1)
    const [ref, data] = firestore.setDoc.mock.calls[0]
    expect(ref.path).toBe(`plans/${saved.uid}`)
    const { uid, ...docData } = saved
    expect(data).toEqual(docData)
  })

  it('addPlan offline only updates the cache', async () => {
    online(false)
    const { action } = await run(plansAC.addPlan(plan('a')), rootState())
    expect(action.type).toBe('plans/addPlans/fulfilled')
    expect(firestore.setDoc).not.toHaveBeenCalled()
  })

  it('updateSelectedPlanWorkout replaces the workout in the selected plan', async () => {
    online(true)
    const w1 = { uid: 'w1', name: 'old', colorIdx: 0, labels: [], exercises: [] }
    const state = rootState({ selectedPlan: plan('p', 1, { workouts: [w1] }) })
    const { action, dispatch } = await run(plansAC.updateSelectedPlanWorkout({ ...w1, name: 'new' }), state)
    expect(action.payload.uid).toBe('p')
    expect(action.payload.workouts[0].name).toBe('new')
    expect(firestore.setDoc.mock.calls[0][0].path).toBe('plans/p')
    expect(firestore.setDoc.mock.calls[0][1]).not.toHaveProperty('uid')
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { ...w1, name: 'new' } }))
  })

  it('deletePlan deletes the document when online', async () => {
    online(true)
    const { action } = await run(plansAC.deletePlan('a'), rootState())
    expect(firestore.deleteDoc.mock.calls[0][0].path).toBe('plans/a')
    expect(action.payload).toEqual({ planUid: 'a', isInternet: true })
  })

  it('rejects with the error message when Firestore fails', async () => {
    online(true)
    firestore.setDoc.mockRejectedValueOnce(new Error('permission-denied'))
    const { action } = await run(plansAC.updatePlan(plan('a')), rootState())
    expect(action.type).toBe('plans/updatePlan/rejected')
    expect(action.payload).toBe('permission-denied')
  })
})
