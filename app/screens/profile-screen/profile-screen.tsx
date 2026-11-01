import * as React from 'react'
import { memo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { clearPlaneResults } from '@store/plans-reducer/plans-slice'
import { resetStores } from '@stores/reset-stores'
import { useSessionUserId } from '@stores/session/use-session-store'
import useProfile from '@services/profiles/use-profile'
import useSignOut from '@services/auth/use-sign-out'
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
  const userId = useSessionUserId()
  const { data: profile } = useProfile(userId)
  const [isLogoutModal, setIsLogoutModal] = useState(false)

  const handleSignedOut = () => {
    dispatch(clearPlaneResults())
    resetStores()
  }
  const signOut = useSignOut({ onSignedOut: handleSignedOut })

  const handleLogoutConfirm = () => {
    if (!signOut.isPending) signOut.mutate()
  }

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
        <UserImage name={profile?.displayName} photoUrl={profile?.photoUrl} />
        <AppText variant='title'>{profile?.displayName}</AppText>
        <AppText variant='caption' tone='secondary'>
          {profile?.email}
        </AppText>
      </Stack>
      {!isOnline && (
        <Stack preset='centerColumn'>
          <NoSignalIcon height={width} />
        </Stack>
      )}
      <AppModal
        isWarning
        onConfirm={handleLogoutConfirm}
        disabled={signOut.isPending}
        onClose={() => setIsLogoutModal(false)}
        isOpen={isLogoutModal}
        text={'Are you sure?'}
        header={'Log out'}
      />
    </Screen>
  )
})
