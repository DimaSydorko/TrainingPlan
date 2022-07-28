import * as React from 'react'
import { memo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSettings, useUser } from '../../Hooks/redux'
import { FlexCenterColumn, FlexEnd, Page, TextHeader, TextSecondary } from '../../Theme/Parents'
import UserImage from '../../Components/UserImage/UserImage'
import { ScreenName } from '../../Utils/constants'
import { IconButton } from '../../Common'
import { icon } from '../../Theme/icons'
import styles from './styles'

export default memo(function ProfileScreen() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const { colors } = useSettings()
  const { user } = useUser()

  return (
    <>
      <Page>
        <FlexEnd>
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
