// Pure helpers for the offline-first sync between the persisted Redux cache and Firestore.
// No Firebase imports here so the logic can be unit tested without mocks.

export type Syncable = { uid: string; lastUpdated?: number }

export type SyncResult<T extends Syncable> = {
  /** What the slice should hold after the sync. */
  merged: T[]
  /** Local items that must be written to Firestore (newer locally, or missing remotely). */
  toUpload: T[]
  /** Document ids deleted while offline that must be deleted in Firestore. */
  toDelete: string[]
}

/**
 * Same rules as the pre-migration thunks:
 * - remote docs deleted locally while offline are dropped;
 * - when both sides have a doc, the one with the larger `lastUpdated` wins (local wins are uploaded);
 * - local docs that don't exist remotely are kept and uploaded.
 */
export function syncWithRemote<T extends Syncable>(
  remote: T[],
  stored: T[] | undefined | null,
  deletedUids: string[] | undefined | null
): SyncResult<T> {
  const local = stored || []
  const deleted = deletedUids || []
  const toUpload: T[] = []

  const merged = remote
    .filter(r => !deleted.includes(r.uid))
    .map(r => {
      const s = local.find(item => item.uid === r.uid)
      if (!s) return r
      const isStoredNewer = (s.lastUpdated || 0) > (r.lastUpdated || 0)
      if (isStoredNewer) toUpload.push(s)
      return isStoredNewer ? s : r
    })

  local.forEach(s => {
    if (!merged.find(m => m.uid === s.uid)) {
      merged.push(s)
      toUpload.push(s)
    }
  })

  return { merged, toUpload, toDelete: [...deleted] }
}

/**
 * Cached items that belong to the signed-in user. The cache survives a lost session (sessionEnded),
 * so another account signing in on the same device must not see or upload the previous one's items.
 */
export function ownedBy<T extends { ownerUid?: string }>(items: T[] | undefined | null, userUid: string): T[] {
  return (items || []).filter(item => !item.ownerUid || item.ownerUid === userUid)
}

/** Firestore documents never contain `uid`; it is the document id. */
export function splitUid<T extends { uid: string }>(item: T): { uid: string; data: Omit<T, 'uid'> } {
  const { uid, ...data } = item
  return { uid, data }
}

/** Message for rejectWithValue; thunks used `e.message` and the slices prefix it. */
export function errorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}
