// Seam owned by A3 (docs/migration/README.md §6). Phase 0 stub.
// TODO(A3): implement with expo-speech (rate/pitch mapping, voice selection, ducking via audio.ts).

export function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number }): void {
  console.warn(`[stub] speech.speak("${text}")`, opts ?? {})
}

export function stopSpeaking(): void {}

export function setSpeechDefaults(opts: { rate?: number; pitch?: number; duck?: boolean }): void {
  console.warn('[stub] speech.setSpeechDefaults', opts)
}
