import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, usePublications, useSettings, useUser } from '../../Hooks/redux'
import { publicationsAC } from '../../store/PublicationsReducer/PublicationsAC'
import { userAC } from '../../store/UserReducer/UserAC'
import UserImage from '../../Components/UserImage/UserImage'
import Publication from '../../Components/Publication/Publication'
import { AppNavigationType } from '../../Utils/types'
import { PUBLICATION_QUERY_LIMIT, ScreenName } from '../../Utils/constants'
import { AppModal, IconButton, InfiniteScroll } from '../../Common'
import { FlexCenterColumn, FlexEnd, TextHeader, TextSecondary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import styles from './styles'

export default memo(function ProfileScreen() {
  const navigation = useNavigation<AppNavigationType>()
  const dispatch = useAppDispatch()
  const { colors, internet } = useSettings()
  const { user } = useUser()
  const { userPublications, isLoading } = usePublications()
  const [isLogoutModal, setIsLogoutModal] = useState(false)

  const getNextChunk = useCallback(() => {
    if (internet.isOnline && userPublications.length >= PUBLICATION_QUERY_LIMIT) {
      const lastVisible = userPublications[userPublications.length - 1]
      dispatch(publicationsAC.get({ lastVisible, isYours: true }))
    }
  }, [userPublications[userPublications.length - 1], internet.isOnline])

  return (
    <InfiniteScroll
      isLoading={isLoading}
      onRefresh={internet.isOnline ? () => dispatch(publicationsAC.get({ isYours: true })) : undefined}
      onScrollToBottom={getNextChunk}
    >
      <FlexEnd>
        {internet.isOnline && (
          <IconButton
            iconName={icon.logout}
            onPress={() => setIsLogoutModal(true)}
            color={colors.textSecondary}
            size={36}
            style={styles.signOutButton}
          />
        )}
        <IconButton
          iconName={icon.settings}
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
        {internet.isOnline &&
          userPublications.map(publication => <Publication key={publication.uid} publication={publication} />)}
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
