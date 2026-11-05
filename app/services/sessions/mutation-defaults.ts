import type { QueryClient } from '@tanstack/react-query'
import { finishSession } from '@api/sessions/finish-session'
import { sessionsKeys } from './query-keys'
import { SESSIONS_MUTATION_SCOPE } from './sessions.constants'
import type { FinishSessionArgs } from './types'

export const registerSessionsMutationDefaults = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(sessionsKeys.finish(), {
    mutationFn: (args: FinishSessionArgs) => finishSession(args),
    scope: { id: SESSIONS_MUTATION_SCOPE },
  })
}
