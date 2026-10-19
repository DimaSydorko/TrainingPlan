import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { View, ViewStyle } from 'react-native'
import { nanoid } from '@utils'
import { AppImage, AppModal, IconButton } from '@common'
import { secondsToMinSec } from '../workout-duration/workout-duration'
import AppText from '@common/app-text/app-text'
import Divider from '@common/divider/divider'
import Stack from '@common/stack/stack'
import { ExerciseType, SelectedExerciseType } from '@utils/types'
import { useScreen } from '@platform/screen'
import { icon } from '@theme/icons'
import Approach from './approach'
import styles from './styles'
import { DETAILS_GUTTER, EDIT_NAME_GUTTER, NAME_GUTTER, OUTSIDE_MODAL_EXTRA_WIDTH } from './exercise.constants'

const IMG_SIZE = 45

interface IExercise {
  idx?: number
  exercise: ExerciseType | SelectedExerciseType
  isEdit?: boolean
  isPublic?: boolean
  isInModal?: boolean
  playingExerciseLap?: number
  onDelete?: (exercise: ExerciseType) => void
  onCopy?: (exercise: ExerciseType, isNew: boolean, idx: number) => void
  onVisibilityToggle?: (exercise: ExerciseType) => void
  color: string
}

export default memo(function Exercise({
  idx,
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
  const { width } = useScreen()
  const isImage = !!exercise.imageUrl
  const editNameWidth = width - (isImage ? EDIT_NAME_GUTTER.WITH_IMAGE : EDIT_NAME_GUTTER.DEFAULT)
  const nameWidth = width - (isImage ? NAME_GUTTER.WITH_IMAGE : NAME_GUTTER.DEFAULT)
  const detailsWidth =
    width - (isImage ? DETAILS_GUTTER.WITH_IMAGE : DETAILS_GUTTER.DEFAULT) + (isInModal ? 0 : OUTSIDE_MODAL_EXTRA_WIDTH)
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
      true,
      idx
    )
  }, [exercise, idx])

  return (
    <>
      {isEdit ? (
        <>
          {isImage && <AppImage src={exercise.imageUrl} size={IMG_SIZE} style={styles.imageContainer} />}
          <Stack preset='spaceBetween' style={containerStyle}>
            <AppText
              variant='title'
              color={isVisible ? color : `${color}80`}
              numberOfLines={1}
              style={{ width: editNameWidth }}
            >
              {exercise.name}
            </AppText>
            <Stack preset='end' style={styles.editActions}>
              {onDelete && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
              {onCopy && <IconButton iconName={icon.copy} onPress={copy} style={styles.iconButton} />}
              {onVisibilityToggle && (
                <IconButton
                  iconName={isVisible ? icon.visibilityOn : icon.visibilityOff}
                  onPress={() => onVisibilityToggle({ ...exercise, isVisible: !isVisible })}
                  style={styles.iconButton}
                />
              )}
            </Stack>
          </Stack>
          <Stack preset='spaceBetween' style={containerStyle}>
            <AppText variant='caption' tone='secondary'>
              {exercise.approaches.length ? `${exercise.approaches.length} laps` : ''}
              {exercise.laps ? ` ${exercise.repeats} rep` : ''}
              {exercise.approaches.length
                ? exercise.approaches[0].weight
                  ? ` ${exercise.approaches[0].weight} kg`
                  : ''
                : ''}
            </AppText>
            {!!exercise.breakTimeInSec && (
              <AppText variant='caption' tone='secondary'>
                Break: {secondsToMinSec(exercise.breakTimeInSec)}
              </AppText>
            )}
          </Stack>
        </>
      ) : (
        <>
          <Stack preset='start'>
            {isImage && <AppImage src={exercise.imageUrl} size={IMG_SIZE} style={{ marginLeft: -10 }} />}
            <View>
              <AppText variant='title' color={color} numberOfLines={1} style={{ width: nameWidth }}>
                {exercise.name}
              </AppText>
              <Stack preset='spaceBetween' style={{ width: detailsWidth }}>
                {!!exercise.breakTimeInSec && (
                  <AppText
                    variant='caption'
                    tone='secondary'
                    style={styles.breakTime}
                    ellipsizeMode='tail'
                    numberOfLines={1}
                  >
                    Break: {secondsToMinSec(exercise.breakTimeInSec)}
                  </AppText>
                )}
                {isPublic && (
                  <AppText variant='caption' tone='secondary'>
                    Laps: {exercise.laps}
                  </AppText>
                )}
              </Stack>
            </View>
          </Stack>
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
