import * as React from 'react'
import { memo } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { FlexStart, TextSecondary } from '../../Theme/Parents'
import { ExerciseType } from '../../Utils/types'
import { useSettings } from '../../Hooks/redux'
import { getWorkoutDuration } from '../../Utils'

interface WorkoutDurationType {
  exercises: ExerciseType[]
}

export const secondsToMinSec = (time: number, isWords = true, isHours = false) => {
  let minSec: string
  const seconds = Math.floor((time % 3600) % 60)
  const minutes = Math.floor((time % 3600) / 60)
  const hours = Math.floor(time / 3600)

  function str_pad_left(string: number, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length)
  }

  if (isWords) {
    if (!seconds) minSec = str_pad_left(minutes, '', 2) + 'min'
    else if (!minutes) minSec = str_pad_left(seconds, '', 2) + 'sec'
    else minSec = str_pad_left(minutes, '', 2) + 'min ' + str_pad_left(seconds, '0', 2) + 'sec'
  } else {
    minSec =
      (isHours ? str_pad_left(hours, '0', 2) + ':' : '') +
      str_pad_left(minutes, '0', 2) +
      ':' +
      str_pad_left(seconds, '0', 2)
  }
  return minSec
}

export default memo(function WorkoutDuration({ exercises }: WorkoutDurationType) {
  const { colors } = useSettings()
  const time = getWorkoutDuration(exercises)
  return (
    <FlexStart>
      <Icon name='timer-outline' size={18} color={colors.textSecondary} />
      <TextSecondary>{secondsToMinSec(time)}</TextSecondary>
    </FlexStart>
  )
})
