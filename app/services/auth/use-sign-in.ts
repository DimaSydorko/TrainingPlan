import { useMutation } from '@tanstack/react-query'
import { signInWithPassword } from '@api/auth/sign-in-with-password'

const useSignIn = () =>
  useMutation({
    mutationFn: signInWithPassword,
    networkMode: 'always',
  })

export default useSignIn
