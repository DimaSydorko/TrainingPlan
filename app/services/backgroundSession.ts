// Seam owned by A4 (docs/migration/README.md §6). Phase 0 stub.
// TODO(A4): implement as an ongoing notification (expo-notifications), see D3.

export type SessionInfo = {
  title: string
  description: string
  color?: string
  progress?: { value: number; max: number }
}

export async function startSession(info: SessionInfo): Promise<void> {
  console.warn('[stub] backgroundSession.startSession', info.title)
}

export async function updateSession(info: Partial<SessionInfo>): Promise<void> {}

export async function stopSession(): Promise<void> {
  console.warn('[stub] backgroundSession.stopSession')
}
