import { createLegacyImport } from './create-legacy-import'
import { getLegacyData } from './legacy-data'
import { getLegacyOwnerEmail, shouldImportLegacyData } from './legacy-owner'
import { mapLegacyDataToPayload } from './mappers'
import type { LegacyImportResult } from './types'

export type RunLegacyImportArgs = { sessionEmail: string; legacyImportedAt?: string }

export const runLegacyImport = async ({
  sessionEmail,
  legacyImportedAt,
}: RunLegacyImportArgs): Promise<LegacyImportResult | null> => {
  const legacyOwnerEmail = await getLegacyOwnerEmail()
  if (!shouldImportLegacyData({ legacyOwnerEmail, sessionEmail, legacyImportedAt })) return null

  const { workouts, plans } = await getLegacyData()

  return createLegacyImport(mapLegacyDataToPayload({ workouts, plans }))
}
