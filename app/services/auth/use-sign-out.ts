import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signOut } from '@api/auth/sign-out'
import { asyncStoragePersister } from '@lib/query-client'
import { signOutGoogle } from '@platform/google-auth'

type UseSignOutArgs = {
  onSignedOut: () => void
}

const signOutEverywhere = async () => {
  await signOutGoogle()
  await signOut()
}

const useSignOut = ({ onSignedOut }: UseSignOutArgs) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOutEverywhere,
    networkMode: 'always',
    onSuccess: async () => {
      onSignedOut()
      queryClient.clear()
      await asyncStoragePersister.removeClient()
    },
  })
}

export default useSignOut
