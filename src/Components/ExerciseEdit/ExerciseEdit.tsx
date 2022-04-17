import React, { useEffect, useState } from 'react'
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
import { ButtonCounter, ConfirmButton, IconButton, MySwitch, MyTextInput, SwipeSelector } from '../../Common'
import { ExerciseType } from '../../Utils/types'
import { colors } from '../../Theme/colors'
import { View } from 'react-native'
import styles from './styles'
import { icon } from '../../Theme/icons'

interface IExerciseEdit {
  exercise: ExerciseType
  onSave: (exercise: ExerciseType) => void
}

type IsType = {
  break: boolean
  laps: boolean
  repeats: boolean
  change: boolean
  visible: boolean
}

export default function ExerciseEdit({ exercise, onSave }: IExerciseEdit) {
  const [is, setIs] = useState<IsType>({
    break: false,
    change: false,
    laps: false,
    repeats: false,
    visible: false,
  })
  const [name, setName] = useState(exercise.name)
  const [selectSeconds, setSelectSeconds] = useState(exercise.breakTimeInSec % 60)
  const [selectMinutes, setSelectMinutes] = useState(Math.round(exercise.breakTimeInSec / 60))
  const [laps, setLaps] = useState(exercise.laps)

  useEffect(() => {
    setIs(prev => ({
      ...prev,
      break: !!exercise.breakTimeInSec,
      laps: !!exercise.laps,
      visible: exercise.isVisible,
      })
    )
  }, [exercise])

  const handleSubmit = () => {
    const newExercise: ExerciseType = {
      ...exercise,
      name,
      laps,
      isVisible: is.visible,
      breakTimeInSec: selectMinutes * 60 + selectSeconds,
      // imgURL: '',
    }
    onSave(newExercise)
    setIs(prev => ({ ...prev, change: false }))
  }

  return (
    <Card>
      {!is.change ? (
        <>
          <FlexSpaceBetween>
            <TextHeader color={exercise.isVisible ? colors.secondPrimary : colors.textSecondary}>
              {exercise.name}
            </TextHeader>
            <FlexStart>
              <IconButton iconName={icon.edit} onPress={() => setIs({ ...is, change: true })} />
              <IconButton
                iconName={is.visible ? icon.visibilityOff : icon.visibilityOn}
                onPress={() => setIs({ ...is, visible: !is.visible })}
              />
              <IconButton iconName={icon.delete} onPress={() => {
              }} />
            </FlexStart>
          </FlexSpaceBetween>
          <FlexSpaceBetween>
            <TextSecondary>
              {exercise.approaches.length} laps {exercise.laps} rep {exercise.approaches[0].weight} kg
            </TextSecondary>
            <TextSecondary>
              Break: {secondsToMinSec(exercise.breakTimeInSec)}
            </TextSecondary>
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

          <FlexSpaceBetween>
            <TextHeader color={colors.textSecondary}>
              Break:
            </TextHeader>
            <View style={styles.switchContainer}>
              <MySwitch
                value={is.break}
                onValueChange={() => setIs(b => ({ ...b, break: !b.break }))}
                color={colors.primary}
              />
            </View>
          </FlexSpaceBetween>
          {is.break && (
            <>
              <SwipeSelector onChange={number => setSelectMinutes(number)} maxValue={60} />
              <TextSecondary>
                min
              </TextSecondary>
              <SwipeSelector onChange={number => setSelectSeconds(number)} maxValue={60} />
              <TextSecondary>
                sec
              </TextSecondary>
            </>
          )}

          <FlexSpaceBetween>
            <TextHeader color={colors.textSecondary}>
              Repeats:
            </TextHeader>
            <View style={styles.switchContainer}>
              <MySwitch
                value={is.repeats}
                onValueChange={() => setIs(b => ({ ...b, repeats: !b.repeats }))}
                color={colors.primary}
              />
            </View>
          </FlexSpaceBetween>
          {is.repeats && <SwipeSelector onChange={number => setSelectSeconds(number)} maxValue={100} />}

          <FlexSpaceBetween>
            <TextHeader color={colors.textSecondary}>Laps</TextHeader>
            <View style={styles.switchContainer}>
              <MySwitch
                value={is.laps}
                onValueChange={() => setIs(b => ({ ...b, laps: !b.laps }))}
                color={colors.primary}
              />
            </View>
          </FlexSpaceBetween>
          {is.laps && <ButtonCounter value={laps} onChange={number => setLaps(number)} />}

          <FlexAlignCenter>
            <ConfirmButton header={'Save'} style={styles.button} onPress={handleSubmit} />
            <ConfirmButton
              header={'Cancel'}
              style={styles.button}
              color={colors.textSecondary}
              onPress={() => setIs({ ...is, change: false })}
            />
          </FlexAlignCenter>
        </FlexCenterColumn>
      )}
    </Card>
  )
}