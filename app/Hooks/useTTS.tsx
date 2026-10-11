import { useCallback } from 'react'
import { speak, stopSpeaking } from '../services/speech'
import { useSettings } from './redux'

export default function useTTS() {
  const {
    tts: { rate, volume },
  } = useSettings()

  return useCallback(
    (textToSpeech: string) => {
      stopSpeaking()
      // TODO(A3): old call used iosVoiceId 'com.apple.ttsbundle.Moira-compact' and Android
      // KEY_PARAM_PAN: 1, KEY_PARAM_STREAM: 'STREAM_MUSIC'
      speak(textToSpeech, { rate: rate, volume: volume })
    },
    [volume, rate]
  )
}
