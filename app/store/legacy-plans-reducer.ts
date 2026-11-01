import type { PlanType } from '@utils/types'

export type LegacyPlansSlice = { plans?: PlanType[] } | null

export const legacyPlansReducer = (state: LegacyPlansSlice = null): LegacyPlansSlice => state
