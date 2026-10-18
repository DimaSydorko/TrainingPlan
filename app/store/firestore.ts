// Small Firestore helpers shared by the thunks.
import { CollectionReference, DocumentData, doc, writeBatch } from 'firebase/firestore'
import { db } from '../utils/firebase'
import { splitUid, Syncable } from './sync'

// Firestore allows 500 writes per batch.
const BATCH_LIMIT = 450

/**
 * Writes local changes found by syncWithRemote(). Like the old code this is fire-and-forget:
 * a pending write must not block the list from loading (Firestore resolves writes only on server ack).
 * Failures are logged instead of becoming unhandled promise rejections.
 */
export function pushSync<T extends Syncable>(
  collectionRef: CollectionReference<DocumentData>,
  toUpload: T[],
  toDelete: string[]
): Promise<void> {
  const ops: ((batch: ReturnType<typeof writeBatch>) => void)[] = [
    ...toUpload.map(item => (batch: ReturnType<typeof writeBatch>) => {
      const { uid, data } = splitUid(item)
      batch.set(doc(collectionRef, uid), data)
    }),
    ...toDelete.map(uid => (batch: ReturnType<typeof writeBatch>) => batch.delete(doc(collectionRef, uid))),
  ]
  if (!ops.length) return Promise.resolve()

  const commits: Promise<void>[] = []
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    ops.slice(i, i + BATCH_LIMIT).forEach(op => op(batch))
    commits.push(batch.commit())
  }
  return Promise.all(commits)
    .then(() => undefined)
    .catch(e => {
      console.warn(`[sync] ${collectionRef.path}: ${e?.message || e}`)
    })
}
