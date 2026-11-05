import { create } from 'zustand'
import { SESSION_STATUS, type SessionStatus } from './session.constants'

type SessionUser = {
  userId: string
  email: string
}

type SessionState = {
  status: SessionStatus
  userId: string | null
  email: string | null
  setSession: (session: SessionUser | null) => void
  reset: () => void
}

const INITIAL_STATE = {
  status: SESSION_STATUS.LOADING as SessionStatus,
  userId: null,
  email: null,
}

export const useSessionStore = create<SessionState>()(set => ({
  ...INITIAL_STATE,
  setSession: session =>
    set(
      session
        ? { status: SESSION_STATUS.SIGNED_IN, userId: session.userId, email: session.email }
        : { status: SESSION_STATUS.SIGNED_OUT, userId: null, email: null }
    ),
  reset: () => set(INITIAL_STATE),
}))

export const useSessionUserId = () => useSessionStore(state => state.userId)
