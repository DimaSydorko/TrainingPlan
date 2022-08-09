import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSettings } from '../../Hooks/redux'
import { WorkoutDuration } from '../../Common'
import { Card, FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
import { AppNavigationType, PublicType } from '../../Utils/types'
import { ScreenName } from '../../Utils/constants'
import PublicButtons from '../../Common/PublicButtons/PublicButtons'

interface IProps {
  publication: PublicType
}

export default memo(function Publication({ publication }: IProps) {
  const navigation = useNavigation<AppNavigationType>()
  const { colors } = useSettings()
  const isPlan = !!publication?.workouts && !publication?.exercises

  const onPress = () => {
    if (isPlan) navigation.navigate(ScreenName.PublicationPlan, { publication })
    else navigation.navigate(ScreenName.PublicationWorkout, { workout: publication })
  }

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <Card borderLeftColor={isPlan ? colors.secondPrimary : undefined}>
          <TextHeader color={colors.secondPrimary}>{publication.name}</TextHeader>
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
              <TextSecondary color={colors.secondPrimary + '80'}>By {publication.ownerName}</TextSecondary>
            </View>
            <PublicButtons publication={publication} />
          </FlexSpaceBetween>
        </Card>
      </TouchableOpacity>
    </>
  )
})
