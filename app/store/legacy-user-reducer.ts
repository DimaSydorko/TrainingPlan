export type LegacyUserSlice = {
  user?: { uid?: string; email?: string | null; displayName?: string } | null
} | null

export const legacyUserReducer = (state: LegacyUserSlice = null): LegacyUserSlice => state
