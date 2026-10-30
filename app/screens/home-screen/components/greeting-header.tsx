import * as React from 'react'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import AppText from '@common/app-text/app-text'
import Stack from '@common/stack/stack'
import UserImage from '@components/user-image/user-image'
import { useUser } from '@hooks/redux'
import { GREETING_HOUR, HOME_DATE_FORMAT } from '../home-screen.constants'
import styles from './greeting-header.styles'

type GreetingHeaderProps = {
  onProfilePress: () => void
}

function getGreetingKey(hour: number) {
  if (hour < GREETING_HOUR.AFTERNOON_START) return 'home:greeting.morning' as const
  if (hour < GREETING_HOUR.EVENING_START) return 'home:greeting.afternoon' as const
  return 'home:greeting.evening' as const
}

export default memo(function GreetingHeader({ onProfilePress }: GreetingHeaderProps) {
  const { t, i18n } = useTranslation('home')
  const { user } = useUser()
  const now = new Date()
  const date = now.toLocaleDateString(i18n.language, HOME_DATE_FORMAT)

  return (
    <Stack preset='spaceBetween' style={styles.container}>
      <View>
        <AppText variant='body' tone='secondary'>
          {t(getGreetingKey(now.getHours()))},
        </AppText>
        <AppText variant='title' style={styles.name}>
          {user?.displayName}
        </AppText>
        <AppText variant='caption' tone='secondary'>
          {date}
        </AppText>
      </View>
      <TouchableOpacity testID='home.profile' onPress={onProfilePress}>
        <UserImage name={user?.displayName ?? ''} photoUrl={user?.photoURL ?? undefined} />
      </TouchableOpacity>
    </Stack>
  )
})
