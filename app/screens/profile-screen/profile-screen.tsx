import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, usePublications, useUser } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { publicationsAC } from '@store/publications-reducer/publications-ac'
import { userAC } from '@store/user-reducer/user-ac'
import UserImage from '@components/user-image/user-image'
import Publication from '@components/publication/publication'
import { ProfileNavigation } from '@utils/types'
import { PUBLICATION_QUERY_LIMIT, appScreen, ScreenName } from '@utils/constants'
import { AppModal, IconButton, InfiniteScroll } from '@common'
import { FlexCenterColumn, FlexEnd, TextHeader, TextSecondary } from '@theme/parents'
import { icon } from '@theme/icons'
import styles from './styles'
import NoSignalIcon from '@assets/icons/no-signal-icon'

export default memo(function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>()
  const dispatch = useAppDispatch()
  const { colors } = useAppTheme()
  const isOnline = useIsOnline()
  const { user } = useUser()
  const { userPublications, isLoading } = usePublications()
  const [isLogoutModal, setIsLogoutModal] = useState(false)

  const getNextChunk = useCallback(() => {
    if (isOnline && userPublications.length >= PUBLICATION_QUERY_LIMIT) {
      const lastVisible = userPublications[userPublications.length - 1]
      dispatch(publicationsAC.get({ lastVisible, isYours: true }))
    }
  }, [userPublications[userPublications.length - 1], isOnline])

  return (
    <InfiniteScroll
      isLoading={isLoading}
      onRefresh={isOnline ? () => dispatch(publicationsAC.get({ isYours: true })) : undefined}
      onScrollToBottom={getNextChunk}
    >
      <FlexEnd>
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
      </FlexEnd>
      <FlexCenterColumn style={styles.profileContainer}>
        <UserImage name={user?.displayName} photoUrl={user?.photoURL} />
        <TextHeader>{user?.displayName}</TextHeader>
        <TextSecondary>{user?.email}</TextSecondary>
      </FlexCenterColumn>
      <FlexCenterColumn>
        {isOnline ? (
          userPublications.map(publication => <Publication key={publication.uid} publication={publication} />)
        ) : (
          <NoSignalIcon height={appScreen.vw} />
        )}
      </FlexCenterColumn>
      <AppModal
        isWarning
        onConfirm={() => dispatch(userAC.signOut())}
        onClose={() => setIsLogoutModal(false)}
        isOpen={isLogoutModal}
        text={'Are you sure?'}
        header={'Log out'}
      />
    </InfiniteScroll>
  )
})
