import AsyncStorage from '@react-native-async-storage/async-storage'
import { LEGACY_PERSIST_ROOT_KEY, LEGACY_USER_SLICE_KEY } from './legacy-import.constants'

type LegacyUserSlice = { user?: { email?: string | null } | null } | null

type ShouldImportLegacyDataArgs = {
  legacyOwnerEmail: string | null
  sessionEmail: string
  legacyImportedAt?: string
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const parseLegacyOwnerEmail = (rawLegacyRoot: string | null): string | null => {
  if (!rawLegacyRoot) return null

  try {
    const legacyRoot = JSON.parse(rawLegacyRoot) as Record<string, string | undefined>
    const rawUserSlice = legacyRoot?.[LEGACY_USER_SLICE_KEY]
    const userSlice = rawUserSlice ? (JSON.parse(rawUserSlice) as LegacyUserSlice) : null
    const email = userSlice?.user?.email

    return email ? normalizeEmail(email) : null
  } catch {
    return null
  }
}

export const getLegacyOwnerEmail = async (): Promise<string | null> =>
  parseLegacyOwnerEmail(await AsyncStorage.getItem(LEGACY_PERSIST_ROOT_KEY))

export const shouldImportLegacyData = ({
  legacyOwnerEmail,
  sessionEmail,
  legacyImportedAt,
}: ShouldImportLegacyDataArgs): boolean =>
  !legacyImportedAt && !!legacyOwnerEmail && !!sessionEmail && legacyOwnerEmail === normalizeEmail(sessionEmail)
