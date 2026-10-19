import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAppTheme } from '@theme/use-app-theme'
import { Labels, WorkoutDuration } from '@common'
import AppText from '@common/app-text/app-text'
import Card from '@common/card/card'
import Stack from '@common/stack/stack'
import { PublicType, PublicationsNavigation } from '@utils/types'
import { ScreenName } from '@utils/constants'
import { useScreen } from '@platform/screen'
import PublicButtons from './public-buttons'
import { LABELS_GUTTER } from './publication.constants'
import { getExerciseColor } from '@theme/tokens'

interface IProps {
  publication: PublicType
}

export default memo(function Publication({ publication }: IProps) {
  const navigation = useNavigation<PublicationsNavigation>()
  const { isDark } = useAppTheme()
  const { width } = useScreen()
  const isPlan = !!publication?.workouts && !publication?.exercises
  const color = getExerciseColor(publication?.colorIdx === undefined ? 3 : publication?.colorIdx, isDark)

  const onPress = () => {
    if (isPlan) navigation.navigate(ScreenName.PublicationPlan, { publication })
    else navigation.navigate(ScreenName.PublicationWorkout, { workout: publication })
  }

  return (
    <>
      <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 10 }}>
        <Card borderLeftColor={isPlan ? color : undefined}>
          <AppText variant='title' color={color}>
            {publication.name}
          </AppText>
          <Stack preset='spaceBetween'>
            <View>
              {isPlan ? (
                <AppText variant='caption' tone='secondary'>
                  {publication.workouts.length} Workouts
                </AppText>
              ) : (
                <Stack preset='start'>
                  <AppText variant='caption' tone='secondary'>
                    {publication.exercises.length} Exercises
                  </AppText>
                  <WorkoutDuration exercises={publication.exercises} />
                </Stack>
              )}
              <Labels labels={publication.labels} style={{ width: width - LABELS_GUTTER }} />
              <AppText variant='caption' tone='inverse'>
                By {publication.ownerName}
              </AppText>
            </View>
            <PublicButtons publication={publication} />
          </Stack>
        </Card>
      </TouchableOpacity>
    </>
  )
})
