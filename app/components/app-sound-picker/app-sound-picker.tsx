import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { previewSound } from '@platform/audio'

import { useAppDispatch, useSettings } from '@hooks/redux'
import { onSoundTypeChange } from '@store/settings-reducer/settings-slice'
import { AppModal } from '@common'
import { getSoundText } from '@utils'
import { SetStateType } from '@utils/types'
import { SoundType } from '@utils/constants'
import { FlexCenterColumn, TextHeader } from '@theme/parents'

// The old code switched to Sound.setCategory('Alarm') here so previews were heard with the silent
// switch on. The shared session from audio.ts already plays in silent mode, so no category change.

type PropsT = {
  isOpen: boolean
  setIsOpen: SetStateType<boolean>
}

export default memo(function AppSoundPicker({ isOpen, setIsOpen }: PropsT) {
  const dispatch = useAppDispatch()
  const { sound, colors } = useSettings()
  const [soundType, setSoundType] = useState<SoundType>(sound?.type || SoundType.Bell)
  const [isPressing, setIsPressing] = useState<boolean>(false)

  useEffect(() => {
    if (isPressing) {
      setTimeout(() => previewSound(soundType, { volume: sound?.volume }), 100)
    }
  }, [soundType, isPressing])

  const onConfirm = useCallback(() => {
    if (soundType !== sound?.type) dispatch(onSoundTypeChange(soundType))
    setIsOpen(false)
  }, [soundType])

  return (
    <AppModal onConfirm={onConfirm} onClose={() => setIsOpen(false)} isOpen={isOpen} header={'Select Sound'}>
      <FlexCenterColumn style={{ alignItems: 'flex-start' }}>
        {Object.values(SoundType).map(s => (
          <TouchableOpacity
            key={s}
            onPressIn={() => {
              setIsPressing(true)
              setSoundType(s)
            }}
            onPressOut={() => setIsPressing(false)}
            style={{ marginVertical: 2, marginHorizontal: 8 }}
          >
            <TextHeader color={s === soundType ? colors.primary : colors.textSecondary}>{`\u2022  ${getSoundText(
              s
            )}`}</TextHeader>
          </TouchableOpacity>
        ))}
      </FlexCenterColumn>
    </AppModal>
  )
})
