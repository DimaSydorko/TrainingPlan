import * as React from 'react'
import { memo } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { FlexStart, TextSecondary } from '../../Theme/Parents'
import { ExerciseType } from '../../Utils/types'
import { useSettings } from '../../Hooks/redux'

interface WorkoutDurationType {
  exercises: ExerciseType[]
}

export const secondsToMinSec = (time: number, isWords = true) => {
  let minSec: string
  const minutes = Math.floor(time / 60)
  const seconds = time - minutes * 60

  function str_pad_left(string: number, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length)
  }

  if (isWords) {
    if (!seconds) minSec = str_pad_left(minutes, '', 2) + 'min'
    else if (!minutes) minSec = str_pad_left(seconds, '0', 2) + 'sec'
    else minSec = str_pad_left(minutes, '', 2) + 'min ' + str_pad_left(seconds, '0', 2) + 'sec'
  } else {
    minSec = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2)
  }
  return minSec
}

export default memo(function WorkoutDuration({ exercises }: WorkoutDurationType) {
  const { colors } = useSettings()
  let time = 0
  exercises.forEach(exercise => (time += exercise.laps * exercise.breakTimeInSec))

  return (
    <FlexStart>
      <Icon name='timer-outline' size={18} color={`${colors.textSecondary}80`} />
      <TextSecondary>{secondsToMinSec(time)}</TextSecondary>
    </FlexStart>
  )
})
