import { supabase } from '@lib/supabase/client'
import type { Json } from '@lib/supabase/database.types'
import type { LegacyImportPayload, LegacyImportResult } from './types'

export async function createLegacyImport(payload: LegacyImportPayload): Promise<LegacyImportResult> {
  const { data, error } = await supabase.rpc('import_legacy_data', { p_payload: payload as unknown as Json })

  if (error) throw error

  return data as unknown as LegacyImportResult
}
