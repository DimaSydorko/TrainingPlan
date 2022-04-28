import * as React from 'react'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import {
  Card,
  FlexCenterColumn,
  FlexEnd,
  FlexSpaceBetween,
  FlexStart,
  TextHeader,
  TextSecondary,
} from '../../Theme/Parents'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { ButtonCounter, IconButton, MyTextInput, SwipeSelector } from '../../Common'
import { ExerciseType } from '../../Utils/types'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'
import styles from './styles'
import AppModal from '../../Common/AppModal/AppModal'

interface IExerciseEdit {
  exercise: ExerciseType
  onDelete: () => void
  onSave: (exercise: ExerciseType) => void
}

export default function ExerciseEdit({ exercise, onSave, onDelete }: IExerciseEdit) {
  const [isEdit, setIsEdit] = useState(false)
  const [isMove, setIsMove] = useState(false)
  const [isVisible, setIsVisible] = useState(exercise.isVisible)
  const [name, setName] = useState(exercise.name)
  const [selectSeconds, setSelectSeconds] = useState(exercise.breakTimeInSec % 60)
  const [selectMinutes, setSelectMinutes] = useState(Math.floor(exercise.breakTimeInSec / 60))
  const [repeats, setRepeats] = useState(exercise.repeats)
  const [laps, setLaps] = useState(exercise.laps)

  const handleSubmit = useCallback(() => {
    const newExercise: ExerciseType = {
      ...exercise,
      name,
      laps,
      repeats,
      isVisible,
      breakTimeInSec: selectMinutes * 60 + selectSeconds,
      // imgURL: '',
    }
    onSave(newExercise)
    setIsEdit(false)
  }, [name, laps, repeats, isVisible, selectMinutes, selectSeconds])

  return (
    <Card>
      <FlexSpaceBetween>
        <TextHeader color={isVisible ? colors.textSecondary : colors.secondPrimary}>{exercise.name}</TextHeader>
        <FlexStart>
          <IconButton iconName={icon.edit} onPress={() => setIsEdit(true)} />
          <IconButton
            iconName={isVisible ? icon.visibilityOff : icon.visibilityOn}
            onPress={() => setIsVisible(prev => !prev)}
          />
          <IconButton iconName={icon.move} onPress={() => setIsMove(true)} />
        </FlexStart>
      </FlexSpaceBetween>
      <FlexSpaceBetween>
        <TextSecondary>
          {exercise.approaches.length} laps {exercise.laps} rep {exercise.approaches[0].weight} kg
        </TextSecondary>
        <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>
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
            <IconButton iconName={icon.delete} onPress={onDelete} />
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
    </Card>
  )
}
