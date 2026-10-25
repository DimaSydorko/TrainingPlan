import * as React from 'react'
import { memo, useCallback, useContext, useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { publicationsAC } from '@store/publications-reducer/publications-ac'
import { useAppDispatch, useUser } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { AppHelperContext } from '@hooks/app-helper-provider'
import { AppNavigationType, PublicType } from '@utils/types'
import AppText from '@common/app-text/app-text'
import Stack from '@common/stack/stack'
import { icon } from '@theme/icons'
import { AppModal, IconButton } from '@common'
import styles from './public-buttons.styles'

type PublicButtonsProps = {
  publication: PublicType
  isOpenedScreen?: boolean
}

export default memo(function PublicButtons({ publication, isOpenedScreen = false }: PublicButtonsProps) {
  const dispatch = useAppDispatch()
  const { addSavedUids, savedUids } = useContext(AppHelperContext)
  const { colors } = useAppTheme()
  const { user } = useUser()
  const navigation = useNavigation<AppNavigationType>()
  const isOwner = publication.ownerUid === (user?.uid || '')
  const isLiked = publication.likes.includes(user?.uid || '')
  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const onSave = () => {
    dispatch(publicationsAC.save(publication))
    addSavedUids(publication.uid)
  }

  const onDelete = useCallback(() => {
    dispatch(publicationsAC.delete(publication))
    if (isOpenedScreen) navigation.goBack()
  }, [publication, isOpenedScreen])

  return (
    <>
      <Stack preset='end' style={styles.container}>
        {isOwner && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
        <View>
          <IconButton
            margin={20}
            iconName={icon.download}
            disabled={savedUids.includes(publication.uid)}
            onPress={onSave}
          />
          <AppText variant='caption' tone='secondary' align='center'>
            {publication.downloads.length}
          </AppText>
        </View>
        <View>
          <IconButton
            iconName={isLiked || isOwner ? icon.like : icon.likeEmpty}
            disabled={isOwner}
            color={isLiked || isOwner ? colors.accent : colors.textSecondary}
            onPress={() =>
              dispatch(
                publicationsAC.likeToggle({
                  publicationUid: publication.uid,
                  isLiked,
                })
              )
            }
          />
          <AppText variant='caption' tone='secondary' align='center'>
            {publication.likes.length}
          </AppText>
        </View>
      </Stack>
      <AppModal
        onConfirm={onDelete}
        onClose={() => setIsDeleteModal(false)}
        isOpen={isDeleteModal}
        isWarning
        text={`Are you sure you want to delete '${publication.name}' publication? \n With ${publication.likes.length} likes and ${publication.downloads.length} downloads`}
        confirmText={'Delete'}
        header={'Delete publication'}
      />
    </>
  )
})
