import reducer, { clearPublicationResults } from '../publications-slice'
import { publicationsAC } from '../publications-ac'

jest.mock('@utils/firebase', () => ({
  db: {},
  auth: {},
  rtdb: {},
  plansCollection: { path: 'plans' },
  workoutsCollection: { path: 'workouts' },
  publicationsCollection: { path: 'publications' },
  usersDataCollection: { path: 'usersData' },
}))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((col, id) => ({ path: `${col.path}/${id}` })),
  getDocs: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn((col, ...constraints) => ({ col, constraints })),
  where: jest.fn((...a) => ({ where: a })),
  orderBy: jest.fn((...a) => ({ orderBy: a })),
  startAt: jest.fn(v => ({ startAt: v })),
  endAt: jest.fn(v => ({ endAt: v })),
  limit: jest.fn(n => ({ limit: n })),
  arrayUnion: jest.fn(v => ({ arrayUnion: v })),
  arrayRemove: jest.fn(v => ({ arrayRemove: v })),
  writeBatch: jest.fn(),
}))
jest.mock('firebase/database', () => ({ get: jest.fn(), ref: jest.fn() }))
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn(() => Promise.resolve({ isConnected: true })) }))

const firestore = jest.requireMock('firebase/firestore')

const pub = (uid: string, extra = {}) => ({
  uid,
  name: uid,
  colorIdx: 0,
  labels: [],
  ownerUid: 'u2',
  ownerName: 'Bob',
  lastUpdated: 1,
  likes: [],
  downloads: [],
  ...extra,
})
const initial = () => reducer(undefined, { type: '@@init' })
const rootState = (publicationsReducer = {}) => ({
  userReducer: { user: { uid: 'u1', displayName: 'Ann' } },
  publicationsReducer: { ...initial(), ...publicationsReducer },
})
const run = (thunk, state = rootState()) => thunk(jest.fn(), () => state, undefined)

beforeEach(() => jest.clearAllMocks())

describe('PublicationsSlice', () => {
  it('appends the next chunk without duplicates and marks the end', () => {
    const start = { ...initial(), publications: [pub('a'), pub('b')] }
    let s = reducer(
      start,
      publicationsAC.get.fulfilled({ publications: [pub('b'), pub('c')], isYours: false, isNextChunk: true }, 'r', {})
    )
    expect(s.publications.map(p => p.uid)).toEqual(['a', 'b', 'c'])
    expect(s.isPublicationsAll).toBe(false)
    s = reducer(
      s,
      publicationsAC.get.fulfilled({ publications: [pub('c')], isYours: false, isNextChunk: true }, 'r', {})
    )
    expect(s.isPublicationsAll).toBe(true)
  })

  it('a first page replaces the list', () => {
    const s = reducer(
      { ...initial(), userPublications: [pub('x')], isUserPublicationsAll: true },
      publicationsAC.get.fulfilled({ publications: [pub('y')], isYours: true, isNextChunk: false }, 'r', {})
    )
    expect(s.userPublications.map(p => p.uid)).toEqual(['y'])
    expect(s.isUserPublicationsAll).toBe(false)
  })

  it('likeToggle adds and removes the like', () => {
    let s = reducer(
      { ...initial(), publications: [pub('a')] },
      publicationsAC.likeToggle.fulfilled({ publicationUid: 'a', isLiked: false, userUid: 'u1' }, 'r', null)
    )
    expect(s.publications[0].likes).toEqual(['u1'])
    s = reducer(
      s,
      publicationsAC.likeToggle.fulfilled({ publicationUid: 'a', isLiked: true, userUid: 'u1' }, 'r', null)
    )
    expect(s.publications[0].likes).toEqual([])
  })

  it('save adds the download, keeps userPublications, and accepts a null payload', () => {
    const start = { ...initial(), publications: [pub('a')], userPublications: [pub('mine', { ownerUid: 'u1' })] }
    const s = reducer(start, publicationsAC.save.fulfilled({ publicationUid: 'a', userUid: 'u1' }, 'r', pub('a')))
    expect(s.publications[0].downloads).toEqual(['u1'])
    expect(s.userPublications.map(p => p.uid)).toEqual(['mine'])
    expect(() => reducer(start, publicationsAC.save.fulfilled(null, 'r', pub('a')))).not.toThrow()
  })

  it('delete and clear', () => {
    let s = reducer(
      { ...initial(), publications: [pub('a')], userPublications: [pub('a')] },
      publicationsAC.delete.fulfilled('a', 'r', pub('a'))
    )
    expect(s.publications).toEqual([])
    expect(s.userPublications).toEqual([])
    s = reducer({ ...s, error: 'x', publications: [pub('b')] }, clearPublicationResults())
    expect(s.publications).toEqual([])
    expect(s.error).toBe('')
  })
})

describe('publicationsAC thunks', () => {
  it('get builds the paginated query and maps documents', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [{ id: 'p1', data: () => ({ name: 'n' }) }] })
    const action = await run(publicationsAC.get({ labels: ['legs'], lastVisible: pub('x', { lastUpdated: 42 }) }))
    expect(firestore.where).toHaveBeenCalledWith('labels', 'array-contains-any', ['legs'])
    expect(firestore.orderBy).toHaveBeenCalledWith('lastUpdated', 'desc')
    expect(firestore.startAt).toHaveBeenCalledWith(42)
    expect(action.payload).toEqual({ publications: [{ name: 'n', uid: 'p1' }], isYours: false, isNextChunk: true })
  })

  it('get skips the request once everything is loaded', async () => {
    const action = await run(publicationsAC.get({ lastVisible: pub('x') }), rootState({ isPublicationsAll: true }))
    expect(firestore.getDocs).not.toHaveBeenCalled()
    expect(action.payload.publications).toEqual([])
  })

  it('add writes the same document shape as before', async () => {
    const workout = { uid: 'w', name: 'W', colorIdx: 2, labels: ['l'], exercises: [{ uid: 'e' }] }
    const action = await run(publicationsAC.add(workout as any))
    const [ref, data] = firestore.setDoc.mock.calls[0]
    expect(ref.path).toBe(`publications/${action.payload.uid}`)
    expect(Object.keys(data).sort()).toEqual(
      ['colorIdx', 'downloads', 'exercises', 'labels', 'lastUpdated', 'likes', 'name', 'ownerName', 'ownerUid'].sort()
    )
    expect(data).toMatchObject({ ownerUid: 'u1', ownerName: 'Ann', likes: [], downloads: [] })
  })

  it('likeToggle uses arrayUnion / arrayRemove', async () => {
    await run(publicationsAC.likeToggle({ publicationUid: 'a', isLiked: false }))
    expect(firestore.updateDoc).toHaveBeenCalledWith({ path: 'publications/a' }, { likes: { arrayUnion: 'u1' } })
    await run(publicationsAC.likeToggle({ publicationUid: 'a', isLiked: true }))
    expect(firestore.updateDoc).toHaveBeenLastCalledWith({ path: 'publications/a' }, { likes: { arrayRemove: 'u1' } })
  })

  it('save copies a workout publication and records the download once', async () => {
    const dispatch = jest.fn()
    const p = pub('a', { exercises: [{ uid: 'e', approaches: [{ repeats: 5, weight: 9 }] }] })
    const action = await publicationsAC.save(p)(dispatch, () => rootState(), undefined)
    expect(dispatch).toHaveBeenCalled()
    expect(firestore.updateDoc).toHaveBeenCalledWith({ path: 'publications/a' }, { downloads: { arrayUnion: 'u1' } })
    expect(action.payload).toEqual({ publicationUid: 'a', userUid: 'u1' })
    const again = await publicationsAC.save({ ...p, downloads: ['u1'] })(jest.fn(), () => rootState(), undefined)
    expect(again.payload).toBeNull()
  })

  it("delete refuses other users' publications", async () => {
    const action = await run(publicationsAC.delete(pub('a')))
    expect(action.type).toBe('publications/delete/rejected')
    expect(firestore.deleteDoc).not.toHaveBeenCalled()
    await run(publicationsAC.delete(pub('m', { ownerUid: 'u1' })))
    expect(firestore.deleteDoc).toHaveBeenCalledWith({ path: 'publications/m' })
  })
})
