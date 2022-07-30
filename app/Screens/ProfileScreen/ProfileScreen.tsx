import * as React from 'react'
import { memo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, useSettings, useUser } from '../../Hooks/redux'
import { FlexCenterColumn, FlexEnd, Page, TextHeader, TextSecondary } from '../../Theme/Parents'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import UserImage from '../../Components/UserImage/UserImage'
import { ScreenName } from '../../Utils/constants'
import { IconButton } from '../../Common'
import { icon } from '../../Theme/icons'
import styles from './styles'

export default memo(function ProfileScreen() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const { colors, internet } = useSettings()
  const { user } = useUser()

  return (
    <>
      <Page>
        <FlexEnd>
          {internet.isOnline && (
            <IconButton
              iconName={icon.logout}
              onPress={() => dispatch(userActionCreators.signOut())}
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
      </Page>
    </>
  )
})
