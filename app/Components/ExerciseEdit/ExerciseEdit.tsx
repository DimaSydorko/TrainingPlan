import * as React from 'react'
import { useState } from 'react'
import { View } from 'react-native'
import {
  Card,
  FlexAlignCenter,
  FlexCenterColumn,
  FlexSpaceBetween,
  FlexStart,
  TextHeader,
  TextSecondary,
} from '../../Theme/Parents'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { ButtonCounter, ConfirmButton, IconButton, MyTextInput, SwipeSelector } from '../../Common'
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
  const [isVisible, setIsVisible] = useState(exercise.isVisible)
  const [name, setName] = useState(exercise.name)
  const [selectSeconds, setSelectSeconds] = useState(exercise.breakTimeInSec % 60)
  const [selectMinutes, setSelectMinutes] = useState(Math.floor(exercise.breakTimeInSec / 60))
  const [repeats, setRepeats] = useState(exercise.repeats)
  const [laps, setLaps] = useState(exercise.laps)

  const handleSubmit = () => {
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
  }

  return (
    <Card>
      {!isEdit ? (
        <>
          <FlexSpaceBetween>
            <TextHeader color={isVisible ? colors.textSecondary : colors.secondPrimary}>{exercise.name}</TextHeader>
            <FlexStart>
              <IconButton iconName={icon.edit} onPress={() => setIsEdit(true)} />
              <IconButton
                iconName={isVisible ? icon.visibilityOff : icon.visibilityOn}
                onPress={() => setIsVisible(prev => !prev)}
              />
              <IconButton iconName={icon.delete} onPress={onDelete} />
            </FlexStart>
          </FlexSpaceBetween>
          <FlexSpaceBetween>
            <TextSecondary>
              {exercise.approaches.length} laps {exercise.laps} rep {exercise.approaches[0].weight} kg
            </TextSecondary>
            <TextSecondary>Break: {secondsToMinSec(exercise.breakTimeInSec)}</TextSecondary>
          </FlexSpaceBetween>
        </>
      ) : (
        <FlexCenterColumn>
          <MyTextInput
            placeholder={'Exercise name'}
            onChangeText={name => setName(name)}
            value={name}
            type={'underline'}
          />

          <TextHeader color={colors.textSecondary}>Break:</TextHeader>
          <FlexSpaceBetween style={{ paddingHorizontal: 50, paddingVertical: 20 }}>
            <View>
              <SwipeSelector onChange={number => setSelectMinutes(number)} value={selectMinutes} maxValue={60} />
              <TextSecondary style={{ textAlign: 'center' }}>min</TextSecondary>
            </View>
            <View>
              <SwipeSelector onChange={number => setSelectSeconds(number)} value={selectSeconds} maxValue={60} />
              <TextSecondary style={{ textAlign: 'center' }}>sec</TextSecondary>
            </View>
          </FlexSpaceBetween>
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

          <FlexAlignCenter>
            <ConfirmButton header={'Save'} style={styles.button} onPress={handleSubmit} />
            <ConfirmButton
              header={'Cancel'}
              style={styles.button}
              color={colors.textSecondary}
              onPress={() => setIsEdit(false)}
            />
          </FlexAlignCenter>
        </FlexCenterColumn>
      )}
    </Card>
  )
}
