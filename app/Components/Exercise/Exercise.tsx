import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { IconButton } from '../../Common'
import { ExerciseType } from '../../Utils/types'
import Approach from './Approach'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'

interface IExerciseEdit {
  exercise: ExerciseType
  isEdit?: boolean
  onVisibilityToggle?: (exercise: ExerciseType) => void
}

export default memo(function ExerciseEdit({ exercise, isEdit = false, onVisibilityToggle }: IExerciseEdit) {
  const [isVisible, setIsVisible] = useState(exercise.isVisible)

  useEffect(() => {
    setIsVisible(prev => (prev === exercise.isVisible ? prev : exercise.isVisible))
  }, [exercise.isVisible])

  return (
    <>
      {isEdit ? (
        <>
          <FlexSpaceBetween>
            <TextHeader color={isVisible ? colors.secondPrimary : colors.textSecondary}>{exercise.name}</TextHeader>
            {onVisibilityToggle && (
              <IconButton
                iconName={isVisible ? icon.visibilityOn : icon.visibilityOff}
                onPress={() => onVisibilityToggle({ ...exercise, isVisible: !isVisible })}
              />
            )}
          </FlexSpaceBetween>
          <FlexSpaceBetween>
            <TextSecondary>
              {exercise.approaches.length ? `${exercise.approaches.length} laps` : ''}
              {exercise.laps ? ` ${exercise.repeats} rep` : ''}
              {exercise.approaches.length
                ? exercise.approaches[0].weight
                  ? ` ${exercise.approaches[0].weight} kg`
                  : ''
                : ''}
            </TextSecondary>
            {!!exercise.breakTimeInSec && (
              <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>
            )}
          </FlexSpaceBetween>
        </>
      ) : (
        <>
          <FlexSpaceBetween>
            <TextHeader color={colors.secondPrimary}>{exercise.name}</TextHeader>
            {!!exercise.breakTimeInSec && (
              <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>
            )}
          </FlexSpaceBetween>
          {exercise.approaches?.map((approach, idx) => (
            <Approach key={idx} isPrevious weight={approach.weight} repeats={approach.repeats} />
          ))}
        </>
      )}
    </>
  )
})
