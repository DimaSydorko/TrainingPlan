import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@api/profiles/get-profile'
import { PROFILE_STALE_TIME_MS } from './profiles.constants'
import { profilesKeys } from './query-keys'

const useProfile = (userId?: string | null) =>
  useQuery({
    queryKey: profilesKeys.detail(userId ?? ''),
    queryFn: () => getProfile(userId!),
    enabled: Boolean(userId),
    staleTime: PROFILE_STALE_TIME_MS,
  })

export default useProfile
