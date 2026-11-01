import type { Tables } from '@lib/supabase/database.types'
import type { Profile } from './types'

type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'display_name' | 'email' | 'photo_url' | 'legacy_imported_at'>

export const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  displayName: row.display_name,
  email: row.email,
  photoUrl: row.photo_url ?? undefined,
  legacyImportedAt: row.legacy_imported_at ?? undefined,
})
