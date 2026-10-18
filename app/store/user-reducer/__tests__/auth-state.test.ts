import { resolveAuthChange, toUserType } from '../auth-state'

const fbUser = (over = {}) => ({ uid: 'u1', displayName: 'Ann', photoURL: null, email: 'a@b.c', ...over })

describe('toUserType', () => {
  it('maps a Firebase user to the stored UserType shape', () => {
    expect(toUserType(fbUser({ displayName: null }))).toEqual({
      uid: 'u1',
      displayName: '',
      photoURL: null,
      email: 'a@b.c',
    })
  })
})

describe('resolveAuthChange', () => {
  it('does nothing when both sides are signed out', () => {
    expect(resolveAuthChange(null, null)).toEqual({ type: 'none' })
  })

  it('logs out when Firebase lost the session but Redux still has a user', () => {
    expect(resolveAuthChange(toUserType(fbUser()), null)).toEqual({ type: 'logout' })
  })

  it('logs in when Firebase has a user Redux does not know', () => {
    expect(resolveAuthChange(null, fbUser())).toEqual({ type: 'login', user: toUserType(fbUser()) })
    expect(resolveAuthChange(toUserType(fbUser({ uid: 'other' })), fbUser()).type).toBe('login')
  })

  it('updates changed profile fields for the same user', () => {
    const change = resolveAuthChange(toUserType(fbUser()), fbUser({ displayName: 'Bob' }))
    expect(change).toEqual({ type: 'update', user: toUserType(fbUser({ displayName: 'Bob' })) })
  })

  it('does not blank a displayName while updateProfile is pending', () => {
    expect(resolveAuthChange(toUserType(fbUser()), fbUser({ displayName: null }))).toEqual({ type: 'none' })
  })

  it('does nothing when nothing changed', () => {
    expect(resolveAuthChange(toUserType(fbUser()), fbUser())).toEqual({ type: 'none' })
  })
})
