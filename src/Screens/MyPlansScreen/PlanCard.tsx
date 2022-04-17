import React, { useState } from 'react'
import { View } from 'react-native'
import { AppModalType, IconButton } from '../../Common'
import { CardPressed, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { PlanType } from '../../Utils/types'
import { icon } from '../../Theme/icons'
import { colors } from '../../Theme/colors'

interface IPlanCard {
  plan: PlanType
  isEditMode: boolean
  onSelect: () => void
  onDelete: () => void
}

export default React.memo(function PlanCard ({plan, isEditMode, onDelete, onSelect}: IPlanCard) {
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  return (
    <>
      <CardPressed onPress={() => onSelect()}>
        <FlexSpaceBetween>
          <View>
            <TextHeader color={colors.secondPrimary}>{plan.name}</TextHeader>
            <TextSecondary>{plan.workoutsCount} Workouts</TextSecondary>
          </View>
          {isEditMode && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
        </FlexSpaceBetween>
      </CardPressed>
      <AppModalType
        isWarning
        header='Delete plan'
        text={`Are you sure you want to delete '${plan.name}' plan?`}
        confirmText='Yes, delete'
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
        onConfirm={() => onDelete()}
      />
    </>
  )
})