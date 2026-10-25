import { useCallback } from 'react'
import { speak, stopSpeaking } from '@platform/speech'
import { useSettingsStore } from '@stores/settings/use-settings-store'

export default function useTTS() {
  const rate = useSettingsStore(state => state.tts.rate)
  const volume = useSettingsStore(state => state.tts.volume)

  return useCallback(
    (textToSpeech: string) => {
      stopSpeaking()
      // The old react-native-tts call hard-coded the iOS 'Moira' voice; speech.ts now picks the
      // best English voice. Android KEY_PARAM_STREAM 'STREAM_MUSIC' is the TTS default stream, so it
      // needs no option. KEY_PARAM_PAN: 1 (right channel only) was dropped on purpose.
      // Pitch comes from setSpeechDefaults (AppHelperProvider), as before.
      speak(textToSpeech, { rate, volume })
    },
    [volume, rate]
  )
}
