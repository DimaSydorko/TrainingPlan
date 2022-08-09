import * as React from 'react'
import { memo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, usePublications, useSettings, useUser } from '../../Hooks/redux'
import { FlexCenterColumn, FlexEnd, Page, TextHeader, TextSecondary } from '../../Theme/Parents'
import { userAC } from '../../store/UserReducer/UserActionCreator'
import UserImage from '../../Components/UserImage/UserImage'
import Publication from '../../Components/Publication/Publication'
import { AppNavigationType } from '../../Utils/types'
import { ScreenName } from '../../Utils/constants'
import { AppModal, IconButton } from '../../Common'
import { icon } from '../../Theme/icons'
import styles from './styles'

export default memo(function ProfileScreen() {
  const navigation = useNavigation<AppNavigationType>()
  const dispatch = useAppDispatch()
  const { colors, internet } = useSettings()
  const { user } = useUser()
  const { userPublications } = usePublications()
  const [isLogoutModal, setIsLogoutModal] = useState(false)
  return (
    <Page>
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
    </Page>
  )
})
