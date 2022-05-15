import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { ViewStyle } from 'react-native'
import { nanoid } from '../../Utils'
import { useSettings } from '../../Hooks/redux'
import { AppImage, AppModal, IconButton } from '../../Common'
import { secondsToMinSec } from '../WorkoutDuration/WorkoutDuration'
import { FlexEnd, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { ExerciseType } from '../../Utils/types'
import { screen } from '../../Utils/constants'
import Approach from './Approach'
import { icon } from '../../Theme/icons'
import styles from './styles'

const IMG_SIZE = 45

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
  const isImage = !!exercise.imageUrl
  const containerStyle: ViewStyle = isImage ? { marginLeft: IMG_SIZE, width: '86.5%' } : {}

  useEffect(() => {
    setIsVisible(prev => (prev === exercise.isVisible ? prev : exercise.isVisible))
  }, [exercise.isVisible])

  const copy = useCallback(() => {
    onCopy(
      {
        ...exercise,
        uid: nanoid(),
        approaches: exercise.approaches.map(() => ({
          repeats: 0,
          weight: 0
        }))
      },
      true
    )
  }, [exercise])

  return (
    <>
      {isEdit ? (
        <>
          {isImage && <AppImage src={exercise.imageUrl} size={IMG_SIZE} style={styles.imageContainer} />}
          <FlexSpaceBetween style={containerStyle}>
            <TextHeader
              color={isVisible ? color : `${color}80`}
              numberOfLines={1}
              style={{ width: screen.vw - (isImage ? 230 : 170) }}
            >
              {exercise.name}
            </TextHeader>
            <FlexEnd style={{ width: 100 }}>
              {onDelete && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
              {onCopy && <IconButton iconName={icon.copy} onPress={copy} style={styles.iconButton} />}
              {onVisibilityToggle && (
                <IconButton
                  iconName={isVisible ? icon.visibilityOn : icon.visibilityOff}
                  onPress={() => onVisibilityToggle({ ...exercise, isVisible: !isVisible })}
                  style={styles.iconButton}
                />
              )}
            </FlexEnd>
          </FlexSpaceBetween>
          <FlexSpaceBetween style={containerStyle}>
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
            {isImage && <AppImage src={exercise.imageUrl} size={IMG_SIZE} style={{ marginLeft: -10 }} />}
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
