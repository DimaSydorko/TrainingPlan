// @ts-nocheck -- jest globals are untyped until A7 adds the Jest tooling (@types/jest); remove then.
// Only the pure spec is tested; keep the real SDK out of the test.
jest.mock('firebase/firestore', () => ({}))

import { publicationsQuerySpec } from '../publicationsQuery'
import { PUBLICATION_QUERY_LIMIT } from '../../../Utils/constants'

const base = { isYours: false, labels: [], userUid: 'u1' }
const order = { field: 'lastUpdated', direction: 'desc' }

describe('publicationsQuerySpec', () => {
  it('lists all publications newest first', () => {
    expect(publicationsQuerySpec(base)).toEqual({ orderBy: order, limit: PUBLICATION_QUERY_LIMIT })
  })

  it("filters by owner for the user's own publications", () => {
    expect(publicationsQuerySpec({ ...base, isYours: true }).filter).toEqual({ field: 'ownerUid', op: '==', value: 'u1' })
  })

  it('filters by labels with array-contains-any, ignoring an empty first label', () => {
    expect(publicationsQuerySpec({ ...base, labels: ['legs', 'arms'] }).filter).toEqual({
      field: 'labels',
      op: 'array-contains-any',
      value: ['legs', 'arms'],
    })
    expect(publicationsQuerySpec({ ...base, labels: [''] }).filter).toBeUndefined()
  })

  it("owner filter wins over labels (as before)", () => {
    expect(publicationsQuerySpec({ ...base, isYours: true, labels: ['x'] }).filter.field).toBe('ownerUid')
  })

  it('paginates from lastVisible with startAt, or up to firstVisible with endAt', () => {
    expect(publicationsQuerySpec({ ...base, lastVisible: { lastUpdated: 50 } }).startAt).toBe(50)
    const spec = publicationsQuerySpec({ ...base, firstVisible: { lastUpdated: 70 } })
    expect(spec.endAt).toBe(70)
    expect(spec.startAt).toBeUndefined()
  })
})
