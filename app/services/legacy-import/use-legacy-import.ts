import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runLegacyImport, type RunLegacyImportArgs } from '@api/legacy-import/run-legacy-import'
import { profilesKeys } from '@services/profiles/query-keys'
import { workoutsKeys } from '@services/workouts/query-keys'
import { plansKeys } from '@services/plans/query-keys'

type UseLegacyImportArgs = {
  userId?: string | null
  sessionEmail?: string | null
  isProfileLoaded: boolean
  legacyImportedAt?: string
  isOnline: boolean
}

const useLegacyImport = ({
  userId,
  sessionEmail,
  isProfileLoaded,
  legacyImportedAt,
  isOnline,
}: UseLegacyImportArgs) => {
  const queryClient = useQueryClient()
  const { mutate, isIdle } = useMutation({
    mutationFn: (args: RunLegacyImportArgs) => runLegacyImport(args),
    onSuccess: result => {
      if (!result || !userId) return
      queryClient.invalidateQueries({ queryKey: workoutsKeys.all })
      queryClient.invalidateQueries({ queryKey: plansKeys.all })
      queryClient.invalidateQueries({ queryKey: profilesKeys.detail(userId) })
    },
  })

  const isReady = Boolean(userId && sessionEmail && isProfileLoaded && isOnline && !legacyImportedAt)

  useEffect(() => {
    if (isReady && isIdle && sessionEmail) mutate({ sessionEmail, legacyImportedAt })
  }, [isReady, isIdle, sessionEmail, legacyImportedAt, mutate])
}

export default useLegacyImport
