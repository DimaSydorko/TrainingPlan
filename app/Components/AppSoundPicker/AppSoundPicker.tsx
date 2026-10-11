import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { previewSound } from '../../services/audio'

import { useAppDispatch, useSettings } from '../../Hooks/redux'
import { onSoundTypeChange } from '../../store/SettingsReducer/SettingsSlice'
import { AppModal } from '../../Common'
import { getSoundText } from '../../Utils'
import { SetStateType } from '../../Utils/types'
import { SoundType } from '../../Utils/constants'
import { FlexCenterColumn, TextHeader } from '../../Theme/Parents'

// TODO(A3): was Sound.setCategory('Alarm') for the picker preview

type PropsT = {
  isOpen: boolean
  setIsOpen: SetStateType<boolean>
}

export default memo(({ isOpen, setIsOpen }: PropsT) => {
  const dispatch = useAppDispatch()
  const { sound, colors } = useSettings()
  const [soundType, setSoundType] = useState<SoundType>(sound?.type || SoundType.Bell)
  const [isPressing, setIsPressing] = useState<boolean>(false)

  useEffect(() => {
    if (isPressing) {
      setTimeout(() => previewSound(soundType), 100)
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
