import { SESSION_STATUS } from '@stores/session/session.constants'
import { useSessionStore } from '@stores/session/use-session-store'

describe('useSessionStore', () => {
  beforeEach(() => useSessionStore.getState().reset())

  it('starts loading until the first auth event', () => {
    expect(useSessionStore.getState()).toMatchObject({ status: SESSION_STATUS.LOADING, userId: null, email: null })
  })

  it('stores a signed-in session', () => {
    useSessionStore.getState().setSession({ userId: 'u1', email: 'a@test.com' })

    expect(useSessionStore.getState()).toMatchObject({
      status: SESSION_STATUS.SIGNED_IN,
      userId: 'u1',
      email: 'a@test.com',
    })
  })

  it('clears the user when the session ends', () => {
    useSessionStore.getState().setSession({ userId: 'u1', email: 'a@test.com' })
    useSessionStore.getState().setSession(null)

    expect(useSessionStore.getState()).toMatchObject({ status: SESSION_STATUS.SIGNED_OUT, userId: null, email: null })
  })

  it('reset returns to loading', () => {
    useSessionStore.getState().setSession(null)
    useSessionStore.getState().reset()

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.LOADING)
  })
})
