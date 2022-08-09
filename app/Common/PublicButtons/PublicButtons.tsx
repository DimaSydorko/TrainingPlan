import * as React from 'react'
import { memo, useCallback, useContext, useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { publicationsAC } from '../../store/PublicationsReducer/PublicationsAC'
import { useAppDispatch, useSettings, useUser } from '../../Hooks/redux'
import { AppHelperContext } from '../../Hooks/AppHelperProvider'
import { AppNavigationType, PublicType } from '../../Utils/types'
import { FlexEnd, TextSecondary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import { AppModal, IconButton } from '../index'

interface IProps {
  publication: PublicType
  isOpenedScreen?: boolean
}

export default memo(function PublicButtons({ publication, isOpenedScreen = false }: IProps) {
  const dispatch = useAppDispatch()
  const { addSavedUids, savedUids } = useContext(AppHelperContext)
  const { colors } = useSettings()
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
      <FlexEnd style={{ width: 150, alignItems: 'flex-start' }}>
        {isOwner && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
        <View>
          <IconButton
            margin={20}
            iconName={icon.download}
            disabled={savedUids.includes(publication.uid)}
            onPress={onSave}
          />
          <TextSecondary center>{publication.downloads.length}</TextSecondary>
        </View>
        <View>
          <IconButton
            iconName={isLiked || isOwner ? icon.like : icon.likeEmpty}
            disabled={isOwner}
            color={isLiked || isOwner ? colors.secondPrimary : colors.textSecondary}
            onPress={() =>
              dispatch(
                publicationsAC.likeToggle({
                  publicationUid: publication.uid,
                  isLiked,
                })
              )
            }
          />
          <TextSecondary center>{publication.likes.length}</TextSecondary>
        </View>
      </FlexEnd>
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
