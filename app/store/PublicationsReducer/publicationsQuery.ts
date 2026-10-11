import { endAt, limit, orderBy, QueryConstraint, startAt, where, WhereFilterOp } from 'firebase/firestore'
import { PUBLICATION_QUERY_LIMIT } from '../../Utils/constants'
import { PublicType } from '../../Utils/types'

export const PUBLICATIONS_ORDER_FIELD = 'lastUpdated'

export type PublicationsQueryArgs = {
  isYours: boolean
  labels: string[]
  userUid: string
  lastVisible?: PublicType
  firstVisible?: PublicType
}

/** Plain description of the publications query, kept pure so it can be unit tested. */
export type PublicationsQuerySpec = {
  filter?: { field: string; op: WhereFilterOp; value: unknown }
  orderBy: { field: string; direction: 'desc' }
  startAt?: unknown
  endAt?: unknown
  limit: number
}

/** Same query shapes as the pre-migration code (pagination by the `lastUpdated` value). */
export function publicationsQuerySpec({
  isYours,
  labels,
  userUid,
  lastVisible,
  firstVisible,
}: PublicationsQueryArgs): PublicationsQuerySpec {
  const spec: PublicationsQuerySpec = {
    orderBy: { field: PUBLICATIONS_ORDER_FIELD, direction: 'desc' },
    limit: PUBLICATION_QUERY_LIMIT,
  }
  if (isYours) spec.filter = { field: 'ownerUid', op: '==', value: userUid }
  else if (labels.length && labels[0]) spec.filter = { field: 'labels', op: 'array-contains-any', value: labels }

  if (lastVisible) spec.startAt = lastVisible[PUBLICATIONS_ORDER_FIELD]
  else if (firstVisible) spec.endAt = firstVisible[PUBLICATIONS_ORDER_FIELD]
  return spec
}

export function buildPublicationsQuery(args: PublicationsQueryArgs): QueryConstraint[] {
  const spec = publicationsQuerySpec(args)
  const constraints: QueryConstraint[] = []
  if (spec.filter) constraints.push(where(spec.filter.field, spec.filter.op, spec.filter.value))
  constraints.push(orderBy(spec.orderBy.field, spec.orderBy.direction))
  if (spec.startAt !== undefined) constraints.push(startAt(spec.startAt))
  if (spec.endAt !== undefined) constraints.push(endAt(spec.endAt))
  constraints.push(limit(spec.limit))
  return constraints
}
