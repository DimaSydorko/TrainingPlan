import * as React from 'react'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { FlexCenterColumn, FlexEnd, FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
import { ButtonCounter, IconButton, MyTextInput, SwipeSelector, AppModal } from '../../Common'
import { defaultApproach } from '../../Utils/constants'
import { ExerciseType } from '../../Utils/types'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'
import styles from './styles'

interface IExerciseEdit {
  exercise: ExerciseType
  onDelete: () => void
  onSave: (exercise: ExerciseType) => void
}

export default function ExerciseEdit({ exercise, onSave, onDelete }: IExerciseEdit) {
  const [isEdit, setIsEdit] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const [isVisible, setIsVisible] = useState(exercise.isVisible)
  const [name, setName] = useState(exercise.name)
  const [selectSeconds, setSelectSeconds] = useState(exercise.breakTimeInSec % 60)
  const [selectMinutes, setSelectMinutes] = useState(Math.floor(exercise.breakTimeInSec / 60))
  const [repeats, setRepeats] = useState(exercise.repeats)
  const [laps, setLaps] = useState(exercise.laps)

  const handleSubmit = useCallback(() => {
    const lapsDif = Math.abs(exercise.approaches.length - laps)
    const approaches =
      exercise.approaches.length < laps
        ? [...exercise.approaches, ...new Array(laps - 1).fill(defaultApproach)]
        : exercise.approaches.slice(lapsDif)
    const newExercise: ExerciseType = {
      ...exercise,
      name,
      laps,
      repeats,
      isVisible,
      approaches,
      breakTimeInSec: selectMinutes * 60 + selectSeconds,
      // imgURL: '',
    }
    onSave(newExercise)
    setIsEdit(false)
  }, [name, laps, repeats, isVisible, selectMinutes, selectSeconds, exercise.approaches])

  return (
    <>
      <FlexSpaceBetween>
        <TextHeader color={isVisible ? colors.textSecondary : colors.secondPrimary}>{exercise.name}</TextHeader>
        <FlexStart>
          <IconButton iconName={icon.edit} onPress={() => setIsEdit(true)} />
          <IconButton
            iconName={isVisible ? icon.visibilityOff : icon.visibilityOn}
            onPress={() => setIsVisible(prev => !prev)}
          />
        </FlexStart>
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
        {!!exercise.breakTimeInSec && <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>}
      </FlexSpaceBetween>
      <AppModal
        onConfirm={handleSubmit}
        onClose={() => setIsEdit(false)}
        isOpen={isEdit}
        header={'Edit exercise'}
        confirmText={'Save exercise'}
      >
        <FlexCenterColumn>
          <FlexEnd>
            <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />
            <IconButton
              iconName={isVisible ? icon.visibilityOff : icon.visibilityOn}
              onPress={() => setIsVisible(prev => !prev)}
            />
          </FlexEnd>
          <MyTextInput
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
              <ButtonCounter value={laps} onChange={number => setLaps(number)} />
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
}
