import * as React from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { AppModal, ButtonCounter, IconButton, MyTextInput, SwipeSelector } from '../../Common'
import { defaultApproach, defaultExercise } from '../../Utils/constants'
import { nanoid } from '../../Utils'
import { ExerciseType } from '../../Utils/types'
import { FlexCenterColumn, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import { colors } from '../../Theme/colors'
import styles from './styles'

interface IEditExerciseModal {
  exercise?: ExerciseType
  onSave: (exercise: ExerciseType) => void
  onClose: () => void
  onDelete: () => void
}

export default memo(function EditExerciseModal({ exercise, onSave, onDelete, onClose }: IEditExerciseModal) {
  const isNewExercise = useMemo(() => !exercise, [exercise])
  const initialEx = useMemo(() => {
    return isNewExercise ? { ...defaultExercise, uid: nanoid() } : exercise
  }, [isNewExercise])

  const [isVisible, setIsVisible] = useState(initialEx.isVisible)
  const [name, setName] = useState(initialEx.name)
  const [selectSeconds, setSelectSeconds] = useState(initialEx.breakTimeInSec % 60)
  const [selectMinutes, setSelectMinutes] = useState(Math.floor(initialEx.breakTimeInSec / 60))
  const [repeats, setRepeats] = useState(initialEx.repeats)
  const [laps, setLaps] = useState(initialEx.laps)
  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const handleSubmit = useCallback(() => {
    const lapsDif = Math.abs(initialEx.approaches.length - laps)
    let approaches =
      repeats > 0
        ? initialEx.approaches.length < laps
          ? [...initialEx.approaches, ...new Array(laps).fill(defaultApproach)]
          : initialEx.approaches.slice(lapsDif)
        : []

    const newExercise: ExerciseType = {
      ...initialEx,
      name,
      laps,
      repeats,
      isVisible,
      approaches,
      breakTimeInSec: selectMinutes * 60 + selectSeconds
      // imgURL: '',
    }
    onSave(newExercise)
    onClose()
  }, [name, laps, repeats, isVisible, selectMinutes, selectSeconds, initialEx])

  return (
    <>
      <AppModal
        isOpen
        disableAutoClose
        onConfirm={handleSubmit}
        onClose={() => {
          isNewExercise && onDelete()
          onClose()
        }}
        header={`${isNewExercise ? 'Create' : 'Edit'} Exercise`}
        confirmText={'Save Exercise'}
        extraPlace={
          <>
            <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />
            <IconButton
              iconName={isVisible ? icon.visibilityOn : icon.visibilityOff}
              onPress={() => setIsVisible(prev => !prev)}
            />
          </>
        }
      >
        <FlexCenterColumn>
          <MyTextInput
            autoFocus={!!isNewExercise}
            placeholder={'Exercise name'}
            onChangeText={name => setName(name)}
            value={name}
            type={'underline'}
          />
          <TextHeader color={colors.textSecondary}>Break:</TextHeader>
          <View style={styles.breakContainer}>
            <FlexSpaceBetween style={styles.swipeContainer}>
              <SwipeSelector onChange={number => setSelectMinutes(number)} value={selectMinutes} maxValue={60} />
              <SwipeSelector onChange={number => setSelectSeconds(number)} value={selectSeconds} maxValue={60} />
            </FlexSpaceBetween>
            <FlexSpaceBetween>
              <TextSecondary style={styles.breakText}>min</TextSecondary>
              <TextSecondary style={styles.breakText}>sec</TextSecondary>
            </FlexSpaceBetween>
          </View>
          <FlexSpaceBetween>
            <View>
              <TextHeader color={colors.textSecondary} style={{ textAlign: 'center' }}>
                Repeats
              </TextHeader>
              <ButtonCounter value={repeats} onChange={number => setRepeats(number)} />
            </View>
            <View>
              <TextHeader color={colors.textSecondary} style={{ textAlign: 'center' }}>
                Laps
              </TextHeader>
              <ButtonCounter value={laps} minValue={1} onChange={number => setLaps(number)} />
            </View>
          </FlexSpaceBetween>
        </FlexCenterColumn>
      </AppModal>
      <AppModal
        isWarning
        isOpen={isDeleteModal}
        header={'Delete exercise'}
        confirmText={'Yes, delete'}
        text={`Are you sure you want to delete '${name}' exercise?`}
        onConfirm={onDelete}
        onClose={() => setIsDeleteModal(false)}
      />
    </>
  )
})
