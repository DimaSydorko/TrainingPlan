import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { previewSound } from '@platform/audio'

import { useAppTheme } from '@theme/use-app-theme'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { AppModal } from '@common'
import { getSoundText } from '@utils'
import { SetStateType } from '@utils/types'
import { SoundType } from '@utils/constants'
import AppText from '@common/app-text/app-text'
import Stack from '@common/stack/stack'
import styles from './app-sound-picker.styles'

// The old code switched to Sound.setCategory('Alarm') here so previews were heard with the silent
// switch on. The shared session from audio.ts already plays in silent mode, so no category change.

type PropsT = {
  isOpen: boolean
  setIsOpen: SetStateType<boolean>
}

export default memo(function AppSoundPicker({ isOpen, setIsOpen }: PropsT) {
  const { colors } = useAppTheme()
  const sound = useSettingsStore(state => state.sound)
  const setStoredSoundType = useSettingsStore(state => state.setSoundType)
  const [soundType, setSoundType] = useState<SoundType>(sound?.type || SoundType.Bell)
  const [isPressing, setIsPressing] = useState<boolean>(false)

  useEffect(() => {
    if (isPressing) {
      setTimeout(() => previewSound(soundType, { volume: sound?.volume }), 100)
    }
  }, [soundType, isPressing])

  const onConfirm = useCallback(() => {
    if (soundType !== sound?.type) setStoredSoundType(soundType)
    setIsOpen(false)
  }, [soundType])

  return (
    <AppModal onConfirm={onConfirm} onClose={() => setIsOpen(false)} isOpen={isOpen} header={'Select Sound'}>
      <Stack preset='centerColumn' style={styles.list}>
        {Object.values(SoundType).map(s => (
          <TouchableOpacity
            key={s}
            onPressIn={() => {
              setIsPressing(true)
              setSoundType(s)
            }}
            onPressOut={() => setIsPressing(false)}
            style={styles.option}
          >
            <AppText
              variant='title'
              color={s === soundType ? colors.primary : colors.textSecondary}
            >{`\u2022  ${getSoundText(s)}`}</AppText>
          </TouchableOpacity>
        ))}
      </Stack>
    </AppModal>
  )
})
