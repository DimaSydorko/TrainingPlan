import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSettings } from '@hooks/redux'
import { Labels, WorkoutDuration } from '@common'
import { Card, FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '@theme/parents'
import { PublicType, PublicationsNavigation } from '@utils/types'
import { appScreen, ScreenName } from '@utils/constants'
import PublicButtons from './public-buttons'
import { COLORS_EXERCISE, colorsDark } from '@theme/colors'

interface IProps {
  publication: PublicType
}

export default memo(function Publication({ publication }: IProps) {
  const navigation = useNavigation<PublicationsNavigation>()
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
              <Labels labels={publication.labels} style={{ width: appScreen.vw - 180 }} />
              <TextSecondary color={colors.black}>By {publication.ownerName}</TextSecondary>
            </View>
            <PublicButtons publication={publication} />
          </FlexSpaceBetween>
        </Card>
      </TouchableOpacity>
    </>
  )
})
