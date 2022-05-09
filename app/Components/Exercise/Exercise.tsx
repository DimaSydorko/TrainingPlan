import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { nanoid } from '../../Utils'
import { useSettings } from '../../Hooks/redux'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { AppModal, IconButton } from '../../Common'
import { FlexEnd, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { ExerciseType } from '../../Utils/types'
import { screen } from '../../Utils/constants'
import Approach from './Approach'
import { icon } from '../../Theme/icons'
import styles from './styles'

interface IExerciseEdit {
  exercise: ExerciseType
  isEdit?: boolean
  onDelete?: (exercise: ExerciseType) => void
  onCopy?: (exercise: ExerciseType, isNew: true) => void
  onVisibilityToggle?: (exercise: ExerciseType) => void
}

export default memo(function ExerciseEdit({
  exercise,
  isEdit = false,
  onCopy,
  onDelete,
  onVisibilityToggle
}: IExerciseEdit) {
  const [isVisible, setIsVisible] = useState(exercise.isVisible)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const { colors } = useSettings()
  const color = exercise.color || colors.primary

  useEffect(() => {
    setIsVisible(prev => (prev === exercise.isVisible ? prev : exercise.isVisible))
  }, [exercise.isVisible])

  return (
    <>
      {isEdit ? (
        <>
          <FlexSpaceBetween>
            <TextHeader color={isVisible ? color : `${color}80`} numberOfLines={1} style={{ width: screen.vw - 170 }}>
              {exercise.name}
            </TextHeader>
            <FlexEnd style={{ width: 100 }}>
              {onDelete && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
              {onCopy && (
                <IconButton
                  iconName={icon.copy}
                  onPress={() => onCopy({ ...exercise, uid: nanoid() }, true)}
                  style={styles.iconButton}
                />
              )}
              {onVisibilityToggle && (
                <IconButton
                  iconName={isVisible ? icon.visibilityOn : icon.visibilityOff}
                  onPress={() => onVisibilityToggle({ ...exercise, isVisible: !isVisible })}
                  style={styles.iconButton}
                />
              )}
            </FlexEnd>
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
            <TextHeader color={color} numberOfLines={1} style={{ width: screen.vw - 200 }}>
              {exercise.name}
            </TextHeader>
            {!!exercise.breakTimeInSec && (
              <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>
            )}
          </FlexSpaceBetween>
          {exercise.approaches?.map((approach, idx) => (
            <Approach key={idx} isPrevious weight={approach.weight} repeats={approach.repeats} />
          ))}
        </>
      )}
      <AppModal
        isWarning
        isOpen={isDeleteModal}
        header={'Delete exercise'}
        confirmText={'Yes, delete'}
        text={`Are you sure you want to delete '${exercise.name}' exercise?`}
        onConfirm={() => onDelete(exercise)}
        onClose={() => setIsDeleteModal(false)}
      />
    </>
  )
})
