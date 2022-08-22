import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { View, ViewStyle } from 'react-native'
import { nanoid } from '../../Utils'
import { AppImage, AppModal, IconButton } from '../../Common'
import { secondsToMinSec } from '../WorkoutDuration/WorkoutDuration'
import { Divider, FlexEnd, FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
import { ExerciseType, SelectedExerciseType } from '../../Utils/types'
import { screen } from '../../Utils/constants'
import { icon } from '../../Theme/icons'
import Approach from './Approach'
import styles from './styles'

const IMG_SIZE = 45

interface IExercise {
  exercise: ExerciseType | SelectedExerciseType
  isEdit?: boolean
  isPublic?: boolean
  isInModal?: boolean
  playingExerciseLap?: number
  onDelete?: (exercise: ExerciseType) => void
  onCopy?: (exercise: ExerciseType, isNew: true) => void
  onVisibilityToggle?: (exercise: ExerciseType) => void
  color: string
}

export default memo(function Exercise({
  exercise,
  isEdit = false,
  isPublic = false,
  isInModal = false,
  onCopy,
  onDelete,
  onVisibilityToggle,
  playingExerciseLap,
  color,
}: IExercise) {
  const [isVisible, setIsVisible] = useState(exercise.isVisible)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
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
          weight: 0,
        })),
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
              style={{ width: screen.vw - (isImage ? 215 : 170) }}
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
          <FlexStart>
            {isImage && <AppImage src={exercise.imageUrl} size={IMG_SIZE} style={{ marginLeft: -10 }} />}
            <View>
              <TextHeader color={color} numberOfLines={1} style={{ width: screen.vw - (isImage ? 110 : 70) }}>
                {exercise.name}
              </TextHeader>
              <FlexSpaceBetween style={{ width: screen.vw - (isImage ? 140 : 100) + (isInModal ? 0 : 40) }}>
                {!!exercise.breakTimeInSec && (
                  <TextSecondary style={{ width: 150 }} ellipsizeMode='tail' numberOfLines={1}>
                    Break: {secondsToMinSec(exercise.breakTimeInSec)}
                  </TextSecondary>
                )}
                {isPublic && <TextSecondary>Laps: {exercise.laps}</TextSecondary>}
              </FlexSpaceBetween>
            </View>
          </FlexStart>
          {!isPublic && (
            <View style={styles.approaches}>
              {exercise.approaches?.map((approach, idx) => {
                const isPrevious = approach.currentWeight === undefined && approach.currentRepeats === undefined
                return (
                  <View key={idx}>
                    {playingExerciseLap === idx + 1 && <Divider isDashed />}
                    <Approach
                      isPrevious={isPrevious}
                      weight={isPrevious ? approach.weight : approach.currentWeight}
                      repeats={isPrevious ? approach.repeats : approach.currentRepeats}
                    />
                  </View>
                )
              })}
            </View>
          )}
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
