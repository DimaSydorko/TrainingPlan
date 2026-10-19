import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { TouchableOpacity } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { useAppTheme } from '@theme/use-app-theme'
import { WorkoutDuration } from '@common'
import Card from '@common/card/card'
import Stack from '@common/stack/stack'
import Screen from '@common/screen/screen'
import AppText from '@common/app-text/app-text'
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
  const { isDark } = useAppTheme()
  const { name, exercises, ownerName } = route.params.workout
  const { width } = useScreen()
  const ownerNameStyle = useMemo(() => ({ width: width * OWNER_NAME_WIDTH_RATIO }), [width])

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Screen>
      <Stack preset='spaceBetween' style={[styles.header, { width }]}>
        <Stack preset='centerColumn' style={styles.ownerColumn}>
          {!!ownerName && (
            <AppText variant='caption' tone='accent' style={ownerNameStyle}>
              By {ownerName}
            </AppText>
          )}
          <WorkoutDuration exercises={exercises} />
        </Stack>
        {!!ownerName && <PublicButtons isOpenedScreen publication={route.params.workout as PublicType} />}
      </Stack>
      <Stack preset='centerColumn' style={styles.list}>
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
      </Stack>
    </Screen>
  )
}
