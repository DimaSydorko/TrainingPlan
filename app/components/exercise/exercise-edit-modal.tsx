import * as React from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Keyboard, View } from 'react-native'
import { AppColorPicker, AppModal, ButtonCounter, IconButton, MyTextInput, SwipeSelector } from '@common'
import ImageSelector from '../image-selector/image-selector'
import { defaultApproach, defaultExercise } from '@utils/constants'
import { ExerciseType } from '@utils/types'
import { nanoid } from '@utils'
import AppText from '@common/app-text/app-text'
import Stack from '@common/stack/stack'
import { icon } from '@theme/icons'
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

  const [isVisible, setIsVisible] = useState<boolean>(initialEx.isVisible)
  const [name, setName] = useState<string>(initialEx.name)
  const [selectSeconds, setSelectSeconds] = useState<number>(initialEx.breakTimeInSec % 60)
  const [selectMinutes, setSelectMinutes] = useState<number>(Math.floor(initialEx.breakTimeInSec / 60))
  const [repeats, setRepeats] = useState<number>(initialEx.repeats)
  const [laps, setLaps] = useState<number>(initialEx.laps)
  const [imageUrl, setImageUrl] = useState<string>(initialEx.imageUrl || '')
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false)
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false)
  const [colorIdx, setColorIdx] = useState<number>(exercise?.colorIdx || 0)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const lapsDif = Math.abs(initialEx.approaches.length - laps)
    let approaches =
      repeats > 0
        ? initialEx.approaches.length < laps
          ? [...initialEx.approaches, ...new Array(lapsDif).fill(defaultApproach)]
          : initialEx.approaches.slice(lapsDif)
        : []

    const newExercise: ExerciseType = {
      ...initialEx,
      name,
      laps,
      repeats,
      isVisible,
      approaches,
      colorIdx,
      imageUrl,
      breakTimeInSec: selectMinutes * 60 + selectSeconds,
    }
    onSave(newExercise)
    onClose()
  }, [name, colorIdx, laps, repeats, isVisible, selectMinutes, selectSeconds, initialEx, imageUrl])

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
        disabled={selectSeconds + selectMinutes <= 0}
        header={`${isNewExercise ? 'Create' : 'Edit'} Exercise`}
        confirmText={'Save'}
        extraPlaceLeft={
          <>
            <AppColorPicker value={colorIdx} onChange={setColorIdx} />
            <ImageSelector value={imageUrl} onSubmit={setImageUrl} />
          </>
        }
        extraPlaceRight={
          <>
            {!isNewExercise && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
            <IconButton
              iconName={isVisible ? icon.visibilityOn : icon.visibilityOff}
              onPress={() => setIsVisible(prev => !prev)}
            />
          </>
        }
      >
        <Stack preset='centerColumn'>
          <MyTextInput
            placeholder={'Exercise name'}
            onChangeText={setName}
            value={name}
            type={'underline'}
            testID='exerciseEdit.name'
          />
          <Stack preset='center'>
            <AppText variant='title' tone='secondary'>
              Break:{' '}
            </AppText>
            {isKeyboardVisible && (
              <AppText variant='title' tone='accent'>
                {selectMinutes} min {selectSeconds} sec
              </AppText>
            )}
          </Stack>
          {!isKeyboardVisible && (
            <View style={styles.breakContainer}>
              <Stack preset='spaceBetween' style={styles.swipeContainer}>
                <SwipeSelector
                  maxValue={60}
                  value={selectMinutes}
                  onChange={setSelectMinutes}
                  testID='exerciseEdit.breakMinutes'
                />
                <SwipeSelector
                  step={5}
                  maxValue={60}
                  value={selectSeconds}
                  onChange={setSelectSeconds}
                  testID='exerciseEdit.breakSeconds'
                />
              </Stack>
              <Stack preset='spaceBetween'>
                <AppText variant='caption' tone='secondary' style={styles.breakText}>
                  min
                </AppText>
                <AppText variant='caption' tone='secondary' style={styles.breakText}>
                  sec
                </AppText>
              </Stack>
            </View>
          )}
          <Stack preset='spaceBetween'>
            <View>
              <AppText variant='title' tone='secondary' align='center'>
                Laps
              </AppText>
              <ButtonCounter value={laps} minValue={1} onChange={setLaps} />
            </View>
            <View>
              <AppText variant='title' tone='secondary' align='center'>
                Repeats
              </AppText>
              <ButtonCounter value={repeats} onChange={setRepeats} />
            </View>
          </Stack>
        </Stack>
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
