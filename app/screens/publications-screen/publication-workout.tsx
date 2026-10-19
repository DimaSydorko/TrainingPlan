import * as React from 'react'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { useAppTheme } from '@theme/use-app-theme'
import { WorkoutDuration } from '@common'
import { Card, FlexCenterColumn, FlexSpaceBetween, Page, TextSecondary } from '@theme/parents'
import { PublicType, PublicationScreensParamList } from '@utils/types'
import Exercise from '@components/exercise/exercise'
import { getExerciseColor } from '@theme/tokens'
import NoDataIcon from '@assets/icons/no-data-icon'
import { ScreenName } from '@utils/constants'
import PublicButtons from '@components/publication/public-buttons'
import { useScreen } from '@platform/screen'
import styles from './publication-details.styles'
import { OWNER_NAME_WIDTH_RATIO } from './publication-details.constants'

type PropsType = StackScreenProps<PublicationScreensParamList, ScreenName.PublicationWorkout>

export default function PublicationWorkout({ route, navigation }: PropsType) {
  const { colors, isDark } = useAppTheme()
  const { name, exercises, ownerName } = route.params.workout
  const { width } = useScreen()

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Page>
      <FlexSpaceBetween style={[styles.header, { width }]}>
        <FlexCenterColumn style={{ alignItems: 'flex-start' }}>
          {!!ownerName && (
            <TextSecondary style={{ width: width * OWNER_NAME_WIDTH_RATIO }} color={colors.accent}>
              By {ownerName}
            </TextSecondary>
          )}
          <WorkoutDuration exercises={exercises} />
        </FlexCenterColumn>
        {!!ownerName && <PublicButtons isOpenedScreen publication={route.params.workout as PublicType} />}
      </FlexSpaceBetween>
      <FlexCenterColumn style={{ padding: 0 }}>
        {exercises.length ? (
          exercises.map(ex => {
            const color = getExerciseColor(ex?.colorIdx || 0, isDark)
            return (
              <TouchableOpacity key={ex.uid}>
                <Card>
                  <Exercise isPublic exercise={ex} color={color} />
                </Card>
              </TouchableOpacity>
            )
          })
        ) : (
          <NoDataIcon />
        )}
      </FlexCenterColumn>
    </Page>
  )
}
