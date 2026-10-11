// Seam owned by A3 (docs/migration/README.md §6). Phase 0 stub.
// TODO(A3): implement with expo-keep-awake (activateKeepAwakeAsync / deactivateKeepAwake).

export function activateKeepAwake(tag?: string): void {
  console.warn(`[stub] keepAwake.activate(${tag ?? ''})`)
}

export function deactivateKeepAwake(tag?: string): void {
  console.warn(`[stub] keepAwake.deactivate(${tag ?? ''})`)
}
