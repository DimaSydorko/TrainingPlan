import * as React from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Keyboard, View } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { AppColorPicker, AppModal, ButtonCounter, IconButton, MyTextInput, SwipeSelector } from '../../Common'
import ImageSelector from '../ImageSelector/ImageSelector'
import { defaultApproach, defaultExercise } from '../../Utils/constants'
import { nanoid } from '../../Utils'
import { ExerciseType } from '../../Utils/types'
import { FlexCenter, FlexCenterColumn, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import styles from './styles'

interface IEditExerciseModal {
  exercise?: ExerciseType
  onSave: (exercise: ExerciseType) => void
  onClose: () => void
  onDelete: () => void
}

export default memo(function EditExerciseModal({ exercise, onSave, onDelete, onClose }: IEditExerciseModal) {
  const { colors } = useSettings()
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
  const [color, setColor] = useState<string>(exercise?.color || colors.primary)

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
      color,
      imageUrl,
      breakTimeInSec: selectMinutes * 60 + selectSeconds
    }
    onSave(newExercise)
    onClose()
  }, [name, color, laps, repeats, isVisible, selectMinutes, selectSeconds, initialEx, imageUrl])

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
            <AppColorPicker value={color} onChange={setColor} />
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
        <FlexCenterColumn>
          <MyTextInput
            autoFocus={!!isNewExercise}
            placeholder={'Exercise name'}
            onChangeText={setName}
            value={name}
            type={'underline'}
          />
          <FlexCenter>
            <TextHeader color={colors.textSecondary}>Break: </TextHeader>
            {isKeyboardVisible && (
              <TextHeader color={colors.secondPrimary}>
                {selectMinutes} min {selectSeconds} sec
              </TextHeader>
            )}
          </FlexCenter>
          {!isKeyboardVisible && (
            <View style={styles.breakContainer}>
              <FlexSpaceBetween style={styles.swipeContainer}>
                <SwipeSelector maxValue={60} value={selectMinutes} onChange={setSelectMinutes} />
                <SwipeSelector step={5} maxValue={60} value={selectSeconds} onChange={setSelectSeconds} />
              </FlexSpaceBetween>
              <FlexSpaceBetween>
                <TextSecondary style={styles.breakText}>min</TextSecondary>
                <TextSecondary style={styles.breakText}>sec</TextSecondary>
              </FlexSpaceBetween>
            </View>
          )}
          <FlexSpaceBetween>
            <View>
              <TextHeader color={colors.textSecondary} style={{ textAlign: 'center' }}>
                Laps
              </TextHeader>
              <ButtonCounter value={laps} minValue={1} onChange={setLaps} />
            </View>
            <View>
              <TextHeader color={colors.textSecondary} style={{ textAlign: 'center' }}>
                Repeats
              </TextHeader>
              <ButtonCounter value={repeats} onChange={setRepeats} />
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
