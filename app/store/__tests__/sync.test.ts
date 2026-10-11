import { errorMessage, ownedBy, splitUid, syncWithRemote } from '../sync'

// Loosely typed on purpose: the sync helpers only look at uid / lastUpdated / ownerUid
type Item = { uid: string; lastUpdated?: number; ownerUid?: string; [key: string]: unknown }
const item = (uid: string, lastUpdated?: number, extra: Record<string, unknown> = {}): Item => ({
  uid,
  lastUpdated,
  ...extra,
})

describe('syncWithRemote', () => {
  it('returns remote items when nothing is cached', () => {
    const remote = [item('a', 1), item('b', 2)]
    expect(syncWithRemote(remote, [], [])).toEqual({ merged: remote, toUpload: [], toDelete: [] })
  })

  it('keeps the newer side and uploads local wins', () => {
    const remote = [item('a', 5, { name: 'remote-a' }), item('b', 1, { name: 'remote-b' })]
    const stored = [item('a', 3, { name: 'local-a' }), item('b', 9, { name: 'local-b' })]
    const { merged, toUpload } = syncWithRemote(remote, stored, [])
    expect(merged.map(m => m.name)).toEqual(['remote-a', 'local-b'])
    expect(toUpload.map(m => m.name)).toEqual(['local-b'])
  })

  it('treats a missing lastUpdated as 0 and lets ties go to remote', () => {
    const { merged, toUpload } = syncWithRemote([item('a', 1, { v: 'r' })], [item('a', 1, { v: 'l' })], [])
    expect(merged[0].v).toBe('r')
    expect(toUpload).toEqual([])
    expect(syncWithRemote([item('a', undefined, { v: 'r' })], [item('a', 2, { v: 'l' })], []).merged[0].v).toBe('l')
  })

  it('drops remote items deleted offline and reports them for deletion', () => {
    const { merged, toDelete } = syncWithRemote([item('a', 1), item('b', 1)], [item('b', 1)], ['a'])
    expect(merged.map(m => m.uid)).toEqual(['b'])
    expect(toDelete).toEqual(['a'])
  })

  it('keeps and uploads cached items missing remotely', () => {
    const local = item('new', 4)
    const { merged, toUpload } = syncWithRemote([item('a', 1)], [local], [])
    expect(merged.map(m => m.uid)).toEqual(['a', 'new'])
    expect(toUpload).toEqual([local])
  })

  it('tolerates undefined cache and deleted lists (old persisted state)', () => {
    expect(syncWithRemote([item('a', 1)], undefined, undefined).merged).toHaveLength(1)
  })
})

describe('ownedBy', () => {
  it('keeps items of the user and items without an owner', () => {
    const items = [item('a', 1, { ownerUid: 'u1' }), item('b', 1, { ownerUid: 'u2' }), item('c', 1)]
    expect(ownedBy(items, 'u1').map(i => i.uid)).toEqual(['a', 'c'])
    expect(ownedBy(undefined, 'u1')).toEqual([])
  })
})

describe('splitUid', () => {
  it('separates the document id from the document data', () => {
    expect(splitUid({ uid: 'x', name: 'n' })).toEqual({ uid: 'x', data: { name: 'n' } })
  })
})

describe('errorMessage', () => {
  it('reads message from errors and stringifies anything else', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
    expect(errorMessage('plain')).toBe('plain')
  })
})
