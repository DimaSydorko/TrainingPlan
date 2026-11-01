import reducer from '@store/workout-reducer/workout-slice'
import { workoutAC } from '@store/workout-reducer/workout-ac'

jest.mock('@utils/firebase', () => ({ rtdb: { name: 'rtdb' } }))
jest.mock('firebase/database', () => ({ get: jest.fn(), ref: jest.fn((db, path) => ({ db, path })) }))
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn() }))

const NetInfo = jest.requireMock('@react-native-community/netinfo')
const database = jest.requireMock('firebase/database')

const initial = () => reducer(undefined, { type: '@@init' })
const run = async thunk => thunk(jest.fn(), () => ({ workoutReducer: initial() }), undefined)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('WorkoutSlice (exercise images only)', () => {
  it('stores exercise images', () => {
    const images = [{ fileName: 'a.gif', storageKey: 'a', downloadUrl: 'u', filter: 'gym' as const }]
    expect(reducer(initial(), workoutAC.getExerciseImages.fulfilled(images, 'r')).exerciseImages).toEqual(images)
  })
})

describe('workoutAC.getExerciseImages', () => {
  it('reads the Realtime Database catalogue', async () => {
    NetInfo.fetch.mockResolvedValue({ isConnected: true })
    const images = [{ fileName: 'a.gif' }]
    database.get.mockResolvedValue({ val: () => images })
    const action = await run(workoutAC.getExerciseImages())
    expect(database.ref).toHaveBeenCalledWith({ name: 'rtdb' }, '/ExerciseImages')
    expect(action.payload).toEqual(images)
    database.get.mockResolvedValue({ val: () => null })
    expect((await run(workoutAC.getExerciseImages())).payload).toEqual([])
  })

  it('returns no images offline', async () => {
    NetInfo.fetch.mockResolvedValue({ isConnected: false })
    expect((await run(workoutAC.getExerciseImages())).payload).toEqual([])
    expect(database.get).not.toHaveBeenCalled()
  })
})
