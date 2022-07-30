import { useCallback } from 'react'
import Tts from 'react-native-tts'
import { useSettings } from './redux'

export default function useTTS() {
  const {
    tts: { rate, volume },
  } = useSettings()

  return useCallback(
    (textToSpeech: string) => {
      Tts.stop()
      Tts.speak(textToSpeech, {
        iosVoiceId: 'com.apple.ttsbundle.Moira-compact',
        rate: rate,
        androidParams: {
          KEY_PARAM_PAN: 1,
          KEY_PARAM_VOLUME: volume,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      })
    },
    [volume, rate]
  )
}
