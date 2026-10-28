import reducer, { clearWorkoutResults, updateSelectedWorkout } from '@store/workout-reducer/workout-slice'
import { workoutAC } from '@store/workout-reducer/workout-ac'

jest.mock('@utils/firebase', () => ({
  db: {},
  auth: {},
  rtdb: { name: 'rtdb' },
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
jest.mock('firebase/database', () => ({ get: jest.fn(), ref: jest.fn((db, path) => ({ db, path })) }))
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn() }))

const NetInfo = jest.requireMock('@react-native-community/netinfo')
const firestore = jest.requireMock('firebase/firestore')
const database = jest.requireMock('firebase/database')

const workout = (uid: string, lastUpdated = 1, extra = {}) => ({
  uid,
  colorIdx: 0,
  name: `w ${uid}`,
  labels: [],
  exercises: [],
  ownerUid: 'u1',
  lastUpdated,
  ...extra,
})
const initial = () => reducer(undefined, { type: '@@init' })
const rootState = (workoutReducer = {}) => ({
  userReducer: { user: { uid: 'u1' } },
  workoutReducer: { ...initial(), ...workoutReducer },
})
const run = async (thunk, state) => {
  const dispatch = jest.fn()
  return thunk(dispatch, () => state, undefined)
}
const online = (isConnected: boolean) => NetInfo.fetch.mockResolvedValue({ isConnected })

beforeEach(() => jest.clearAllMocks())

describe('WorkoutSlice reducers', () => {
  it('getWorkouts.fulfilled keeps pending offline deletes when loaded offline', () => {
    const start = { ...initial(), deletedWorkoutUids: ['x'] }
    const off = reducer(start, workoutAC.getWorkouts.fulfilled({ workouts: [workout('a')], isInternet: false }, 'r'))
    expect(off.deletedWorkoutUids).toEqual(['x'])
    expect(off.workouts).toEqual([workout('a')])
    const on = reducer(start, workoutAC.getWorkouts.fulfilled({ workouts: [], isInternet: true }, 'r'))
    expect(on.deletedWorkoutUids).toEqual([])
  })

  it('deleteWorkouts.fulfilled removes workouts and remembers offline deletes', () => {
    const start = { ...initial(), workouts: [workout('a'), workout('b'), workout('c')] }
    const s = reducer(
      start,
      workoutAC.deleteWorkouts.fulfilled({ workoutUids: ['a', 'c'], isInternet: false }, 'r', [])
    )
    expect(s.workouts.map(w => w.uid)).toEqual(['b'])
    expect(s.deletedWorkoutUids).toEqual(['a', 'c'])
  })

  it('updateWorkout.fulfilled merges into the selected workout and tolerates no selection', () => {
    const start = { ...initial(), workouts: [workout('a')], selectedWorkout: workout('a') }
    const s = reducer(start, workoutAC.updateWorkout.fulfilled(workout('a', 2, { name: 'new' }), 'r', workout('a')))
    expect(s.workouts[0].name).toBe('new')
    expect(s.selectedWorkout.name).toBe('new')
    const none = { ...start, selectedWorkout: null }
    expect(() => reducer(none, workoutAC.updateWorkout.fulfilled(workout('a'), 'r', workout('a')))).not.toThrow()
  })

  it('stores exercise images and clears results', () => {
    const images = [{ fileName: 'a.gif', storageKey: 'k', downloadUrl: 'u', filter: 'gym' }] as any[]
    let s = reducer(initial(), workoutAC.getExerciseImages.fulfilled(images, 'r'))
    expect(s.exerciseImages).toEqual(images)
    s = reducer({ ...s, workouts: [workout('a')] }, updateSelectedWorkout(workout('a')))
    s = reducer(s, clearWorkoutResults())
    expect(s.workouts).toEqual([])
    expect(s.selectedWorkout).toBeNull()
    expect(s.exerciseImages).toEqual(images)
  })
})

describe('workoutAC thunks', () => {
  it('getWorkouts merges remote and cached workouts and pushes local changes', async () => {
    online(true)
    firestore.getDocs.mockResolvedValue({
      docs: [{ id: 'a', data: () => ({ name: 'remote', lastUpdated: 10, ownerUid: 'u1' }) }],
    })
    const state = rootState({ workouts: [workout('a', 5), workout('mine', 1)], deletedWorkoutUids: ['d'] })
    const action = await run(workoutAC.getWorkouts(), state)
    expect(action.payload.workouts.map(w => [w.uid, w.name])).toEqual([
      ['a', 'remote'],
      ['mine', 'w mine'],
    ])
    expect(firestore.__batch.set.mock.calls.map(([ref]) => ref.path)).toEqual(['workouts/mine'])
    expect(firestore.__batch.delete.mock.calls.map(([ref]) => ref.path)).toEqual(['workouts/d'])
  })

  it('getWorkouts offline returns the cache', async () => {
    online(false)
    const action = await run(workoutAC.getWorkouts(), rootState({ workouts: [workout('a')] }))
    expect(action.payload).toEqual({ workouts: [workout('a')], isInternet: false })
  })

  it('addWorkout sets owner, id and timestamp without mutating the argument', async () => {
    online(true)
    const input = Object.freeze(workout('', 0, { ownerUid: undefined }))
    const action = await run(workoutAC.addWorkout(input), rootState())
    expect(action.type).toBe('workout/addWorkout/fulfilled')
    expect(action.payload.ownerUid).toBe('u1')
    expect(action.payload.uid).toHaveLength(16)
    const [ref, data] = firestore.setDoc.mock.calls[0]
    expect(ref.path).toBe(`workouts/${action.payload.uid}`)
    expect(data).not.toHaveProperty('uid')
    expect(data.ownerUid).toBe('u1')
  })

  it('updateWorkout uses updateDoc with the document data', async () => {
    online(true)
    const action = await run(workoutAC.updateWorkout(workout('a')), rootState())
    const [ref, data] = firestore.updateDoc.mock.calls[0]
    expect(ref.path).toBe('workouts/a')
    expect(data).not.toHaveProperty('uid')
    expect(action.payload.lastUpdated).toBeGreaterThan(1)
  })

  it('deleteWorkouts deletes each document when online', async () => {
    online(true)
    const action = await run(workoutAC.deleteWorkouts(['a', 'b']), rootState())
    expect(firestore.__batch.delete.mock.calls.map(([ref]) => ref.path)).toEqual(['workouts/a', 'workouts/b'])
    expect(action.payload).toEqual({ workoutUids: ['a', 'b'], isInternet: true })
  })

  it('getExerciseImages reads the Realtime Database catalogue', async () => {
    online(true)
    const images = [{ fileName: 'a.gif' }]
    database.get.mockResolvedValue({ val: () => images })
    const action = await run(workoutAC.getExerciseImages(), rootState())
    expect(database.ref).toHaveBeenCalledWith({ name: 'rtdb' }, '/ExerciseImages')
    expect(action.payload).toEqual(images)
    database.get.mockResolvedValue({ val: () => null })
    expect((await run(workoutAC.getExerciseImages(), rootState())).payload).toEqual([])
  })
})
