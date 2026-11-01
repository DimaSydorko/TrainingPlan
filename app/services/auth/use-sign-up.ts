import { useMutation } from '@tanstack/react-query'
import { signUp } from '@api/auth/sign-up'

const useSignUp = () =>
  useMutation({
    mutationFn: signUp,
    networkMode: 'always',
  })

export default useSignUp
