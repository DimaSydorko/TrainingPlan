import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { IconButton } from '../../Common'
import { ExerciseType } from '../../Utils/types'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'

interface IExerciseEdit {
  exercise: ExerciseType
  isNewExercise: boolean
  onVisibilityToggle: (exercise: ExerciseType) => void
}

export default memo(function ExerciseEdit({ exercise, isNewExercise, onVisibilityToggle }: IExerciseEdit) {
  const [isVisible, setIsVisible] = useState(exercise.isVisible)

  useEffect(() => {
    setIsVisible(prev => (prev === exercise.isVisible ? prev : exercise.isVisible))
  }, [exercise.isVisible])

  return (
    <>
      {!isNewExercise && (
        <>
          <FlexSpaceBetween>
            <TextHeader color={isVisible ? colors.secondPrimary : colors.textSecondary}>{exercise.name}</TextHeader>
            <IconButton
              iconName={isVisible ? icon.visibilityOn : icon.visibilityOff}
              onPress={() => onVisibilityToggle({ ...exercise, isVisible: !isVisible })}
            />
          </FlexSpaceBetween>
          <FlexSpaceBetween>
            <TextSecondary>
              {exercise.approaches.length ? `${exercise.approaches.length} laps` : ''}
              {exercise.laps ? `${exercise.laps} rep` : ''}
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
      )}
    </>
  )
})
