import { useCallback, useEffect } from 'react'
import Tts from 'react-native-tts'

export default function useTTS() {
  useEffect(() => {
    Tts.setDefaultRate(0.4)
    Tts.setDefaultPitch(1.2)
    Tts.setDucking(true)
  }, [])

  const onSay = useCallback((textToSpeech: string) => {
    Tts.stop()
    Tts.speak(textToSpeech, {
      iosVoiceId: 'com.apple.ttsbundle.Moira-compact',
      rate: 0.5,
      androidParams: {
        KEY_PARAM_PAN: 1,
        KEY_PARAM_VOLUME: 0.5,
        KEY_PARAM_STREAM: 'STREAM_MUSIC'
      }
    })
  }, [])

  return onSay
}
