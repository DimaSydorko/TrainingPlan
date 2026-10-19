import * as React from 'react'
import { memo, useState } from 'react'
import { View } from 'react-native'
import { Icon } from '@common/icon/icon'
import { AppModal, Labels } from '@common'
import { useAppTheme } from '@theme/use-app-theme'
import Stack from '@common/stack/stack'
import AppText from '@common/app-text/app-text'
import { PlanType } from '@utils/types'
import { icon } from '@theme/icons'

interface IPlanCard {
  plan: PlanType
  isSelected: boolean
  color: string
  onDelete?: () => void
}

export default memo(function PlanCard({ plan, isSelected, onDelete, color }: IPlanCard) {
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const { colors } = useAppTheme()

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
      <Stack preset='spaceBetween'>
        <View>
          <AppText variant='title' color={color}>
            {plan.name}
          </AppText>
          <AppText variant='caption' tone='secondary'>
            {plan?.workouts?.length || 0} Workouts
          </AppText>
          <Labels labels={plan.labels} />
        </View>
      </Stack>
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
