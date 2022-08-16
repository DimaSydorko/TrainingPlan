import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSettings } from '../../Hooks/redux'
import { Labels, WorkoutDuration } from '../../Common'
import { Card, FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
import { AppNavigationType, PublicType } from '../../Utils/types'
import { ScreenName } from '../../Utils/constants'
import PublicButtons from './PublicButtons'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'

interface IProps {
  publication: PublicType
}

export default memo(function Publication({ publication }: IProps) {
  const navigation = useNavigation<AppNavigationType>()
  const { colors } = useSettings()
  const isPlan = !!publication?.workouts && !publication?.exercises
  const isDarkTheme = colors.primary === colorsDark.primary
  const color = COLORS_EXERCISE[publication?.colorIdx === undefined ? 3 : publication?.colorIdx][+isDarkTheme]

  const onPress = () => {
    if (isPlan) navigation.navigate(ScreenName.PublicationPlan, { publication })
    else navigation.navigate(ScreenName.PublicationWorkout, { workout: publication })
  }

  return (
    <>
      <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 10 }}>
        <Card borderLeftColor={isPlan ? color : undefined}>
          <TextHeader color={color}>{publication.name}</TextHeader>
          <FlexSpaceBetween>
            <View>
              {isPlan ? (
                <TextSecondary>{publication.workouts.length} Workouts</TextSecondary>
              ) : (
                <FlexStart>
                  <TextSecondary>{publication.exercises.length} Exercises</TextSecondary>
                  <WorkoutDuration exercises={publication.exercises} />
                </FlexStart>
              )}
              <Labels labels={publication.labels} />
              <TextSecondary color={colors.black}>By {publication.ownerName}</TextSecondary>
            </View>
            <PublicButtons publication={publication} />
          </FlexSpaceBetween>
        </Card>
      </TouchableOpacity>
    </>
  )
})
