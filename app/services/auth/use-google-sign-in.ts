import { useMutation } from '@tanstack/react-query'
import { signInWithGoogleIdToken } from '@api/auth/sign-in-with-google-id-token'
import { getGoogleIdToken } from '@platform/google-auth'

const signInWithGoogle = async () => signInWithGoogleIdToken(await getGoogleIdToken())

const useGoogleSignIn = () =>
  useMutation({
    mutationFn: signInWithGoogle,
    networkMode: 'always',
  })

export default useGoogleSignIn
