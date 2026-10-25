import * as React from 'react'
import { memo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, useUser } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { userAC } from '@store/user-reducer/user-ac'
import UserImage from '@components/user-image/user-image'
import { ProfileNavigation } from '@utils/types'
import { ScreenName } from '@utils/constants'
import { AppModal, IconButton } from '@common'
import Stack from '@common/stack/stack'
import Screen from '@common/screen/screen'
import AppText from '@common/app-text/app-text'
import { icon } from '@theme/icons'
import styles from './styles'
import NoSignalIcon from '@assets/icons/no-signal-icon'
import { useScreen } from '@platform/screen'

export default memo(function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>()
  const dispatch = useAppDispatch()
  const { colors } = useAppTheme()
  const { width } = useScreen()
  const isOnline = useIsOnline()
  const { user } = useUser()
  const [isLogoutModal, setIsLogoutModal] = useState(false)

  return (
    <Screen>
      <Stack preset='end'>
        {isOnline && (
          <IconButton
            iconName={icon.logout}
            testID='profile.logout'
            onPress={() => setIsLogoutModal(true)}
            color={colors.textSecondary}
            size={36}
            style={styles.signOutButton}
          />
        )}
        <IconButton
          iconName={icon.settings}
          testID='profile.settings'
          onPress={() => navigation.navigate(ScreenName.Settings)}
          color={colors.textSecondary}
          size={36}
          style={styles.settingsButton}
        />
      </Stack>
      <Stack preset='centerColumn' style={styles.profileContainer}>
        <UserImage name={user?.displayName} photoUrl={user?.photoURL} />
        <AppText variant='title'>{user?.displayName}</AppText>
        <AppText variant='caption' tone='secondary'>
          {user?.email}
        </AppText>
      </Stack>
      {!isOnline && (
        <Stack preset='centerColumn'>
          <NoSignalIcon height={width} />
        </Stack>
      )}
      <AppModal
        isWarning
        onConfirm={() => dispatch(userAC.signOut())}
        onClose={() => setIsLogoutModal(false)}
        isOpen={isLogoutModal}
        text={'Are you sure?'}
        header={'Log out'}
      />
    </Screen>
  )
})
