import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
const Sound = require('react-native-sound')

import { useAppDispatch, useSettings } from '../../Hooks/redux'
import { onSoundTypeChange } from '../../store/SettingsReducer/SettingsSlice'
import { AppModal } from '../../Common'
import { getSoundText } from '../../Utils'
import { SetStateType } from '../../Utils/types'
import { SoundType } from '../../Utils/constants'
import { FlexCenterColumn, TextHeader } from '../../Theme/Parents'

Sound.setCategory('Alarm')

type PropsT = {
  isOpen: boolean
  setIsOpen: SetStateType<boolean>
}

export default memo(({ isOpen, setIsOpen }: PropsT) => {
  const dispatch = useAppDispatch()
  const { sound, colors } = useSettings()
  const [soundType, setSoundType] = useState<SoundType>(sound?.type || SoundType.Bell)
  const [isPressing, setIsPressing] = useState<boolean>(false)
  const playSound = new Sound(soundType, Sound.MAIN_BUNDLE)

  useEffect(() => {
    if (isPressing) {
      setTimeout(() => playSound.play(), 100)
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
