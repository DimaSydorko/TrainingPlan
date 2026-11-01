import { AuthApiError } from '@supabase/supabase-js'
import { supabase } from '@lib/supabase/client'
import { signInWithPassword } from '@api/auth/sign-in-with-password'
import { signUp } from '@api/auth/sign-up'
import { signInWithGoogleIdToken } from '@api/auth/sign-in-with-google-id-token'
import { signOut } from '@api/auth/sign-out'
import { subscribeToAuthSession } from '@api/auth/subscribe-to-auth-session'

const auth = jest.mocked(supabase.auth)

describe('auth fetchers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('signs in with a trimmed e-mail', async () => {
    await signInWithPassword({ email: ' a@test.com ', password: 'secret12' })

    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@test.com', password: 'secret12' })
  })

  it('throws an AuthRequestError with the mapped code', async () => {
    auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    } as never)

    await expect(signInWithPassword({ email: 'a@test.com', password: 'x' })).rejects.toMatchObject({
      name: 'AuthRequestError',
      code: 'invalid_credentials',
    })
  })

  it('signs up with the display name as full_name metadata', async () => {
    await signUp({ email: 'a@test.com', password: 'secret12', displayName: ' Dmytro ' })

    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'a@test.com',
      password: 'secret12',
      options: { data: { full_name: 'Dmytro' } },
    })
  })

  it('reports that e-mail confirmation is needed when sign-up returns no session', async () => {
    await expect(signUp({ email: 'a@test.com', password: 'secret12', displayName: 'D' })).resolves.toEqual({
      needsEmailConfirmation: true,
    })
  })

  it('reports no confirmation needed when sign-up returns a session', async () => {
    auth.signUp.mockResolvedValueOnce({ data: { user: {}, session: {} }, error: null } as never)

    await expect(signUp({ email: 'a@test.com', password: 'secret12', displayName: 'D' })).resolves.toEqual({
      needsEmailConfirmation: false,
    })
  })

  it('signs in with a Google ID token', async () => {
    await signInWithGoogleIdToken('google-token')

    expect(auth.signInWithIdToken).toHaveBeenCalledWith({ provider: 'google', token: 'google-token' })
  })

  it('signs out locally so it works offline', async () => {
    await signOut()

    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('maps auth state changes to a session and unsubscribes', () => {
    const unsubscribe = jest.fn()
    const listener = jest.fn()
    auth.onAuthStateChange.mockImplementationOnce(callback => {
      callback('SIGNED_IN', { user: { id: 'u1', email: 'a@test.com' } } as never)
      callback('SIGNED_OUT', null)
      return { data: { subscription: { unsubscribe } } } as never
    })

    const stop = subscribeToAuthSession(listener)
    stop()

    expect(listener).toHaveBeenNthCalledWith(1, { userId: 'u1', email: 'a@test.com' })
    expect(listener).toHaveBeenNthCalledWith(2, null)
    expect(unsubscribe).toHaveBeenCalled()
  })
})
