import * as React from 'react'
import { memo, useState } from 'react'
import { View } from 'react-native'
import { AppModal, IconButton } from '../../Common'
import { useSettings } from '../../Hooks/redux'
import { CardPressed, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { PlanType } from '../../Utils/types'
import { icon } from '../../Theme/icons'

interface IPlanCard {
  plan: PlanType
  isEditMode: boolean
  onSelect: () => void
  onDelete: () => void
}

export default memo(function PlanCard({ plan, isEditMode, onDelete, onSelect }: IPlanCard) {
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const { colors } = useSettings()

  return (
    <>
      <CardPressed onPress={onSelect}>
        <FlexSpaceBetween>
          <View>
            <TextHeader color={colors.secondPrimary}>{plan.name}</TextHeader>
            <TextSecondary>{plan.workoutUids.length} Workouts</TextSecondary>
          </View>
          {isEditMode && <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />}
        </FlexSpaceBetween>
      </CardPressed>
      <AppModal
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
