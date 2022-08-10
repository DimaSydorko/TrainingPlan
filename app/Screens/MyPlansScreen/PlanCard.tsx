import * as React from 'react'
import { memo, useState } from 'react'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AppModal, Labels } from '../../Common'
import { useSettings } from '../../Hooks/redux'
import { FlexSpaceBetween, FlexStart, TextHeader, TextSecondary } from '../../Theme/Parents'
import { PlanType } from '../../Utils/types'
import { icon } from '../../Theme/icons'

interface IPlanCard {
  plan: PlanType
  isSelected: boolean
  onDelete?: () => void
}

export default memo(function PlanCard({ plan, isSelected, onDelete }: IPlanCard) {
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const { colors } = useSettings()

  return (
    <>
      {isSelected && (
        <Icon
          name={icon.checkCircle}
          color={colors.primary}
          size={16}
          style={{ position: 'absolute', left: -12, top: -12 }}
        />
      )}
      <FlexSpaceBetween>
        <View>
          <TextHeader color={colors.secondPrimary}>{plan.name}</TextHeader>
          <TextSecondary>{plan.workoutUids.length} Workouts</TextSecondary>
          <Labels labels={plan.labels} />
        </View>
      </FlexSpaceBetween>
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
