import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsKeys } from './query-keys'
import type { FinishSessionArgs, FinishSessionResult } from './types'

const useFinishSession = () => {
  const queryClient = useQueryClient()

  return useMutation<FinishSessionResult, Error, FinishSessionArgs>({
    mutationKey: sessionsKeys.finish(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: sessionsKeys.all }),
  })
}

export default useFinishSession
