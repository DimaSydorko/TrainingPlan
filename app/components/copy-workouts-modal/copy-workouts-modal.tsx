import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Icon } from '@common/icon/icon'

import { usePlans } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { AppModal } from '@common'
import { PlanType } from '@utils/types'
import { Card, TextHeader, TextSecondary } from '@theme/parents'
import { icon } from '@theme/icons'
import styles from './styles'
import { COLORS_EXERCISE } from '@theme/colors'

interface PropsType {
  isOpen: boolean
  isInPlan: boolean
  onClose: () => void
  onCopy: (plan: PlanType | undefined) => void
}

export default memo(function CopyWorkoutsModal({ onClose, onCopy, isOpen, isInPlan }: PropsType) {
  const { plans, selectedPlan } = usePlans()
  const { colors, isDark } = useAppTheme()
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined)

  const onConfirmCopy = useCallback(() => {
    setSelectedIdx(undefined)
    onCopy(plans.find((_, idx) => idx === selectedIdx))
  }, [onCopy, plans, selectedIdx])

  const onRefuse = useCallback(() => {
    onClose()
    setSelectedIdx(undefined)
  }, [onClose])

  return (
    <AppModal
      onConfirm={onConfirmCopy}
      confirmText='Copy'
      onClose={onRefuse}
      isOpen={isOpen}
      disabled={selectedIdx === undefined}
      header={'Copy workout'}
    >
      <ScrollView style={styles.container}>
        {isInPlan ? (
          <TouchableOpacity onPress={() => setSelectedIdx(-1)}>
            <Card style={[styles.plan, { borderLeftColor: colors.secondPrimary, borderLeftWidth: 3 }]}>
              {selectedIdx === -1 && (
                <Icon name={icon.checkCircle} color={colors.primary} size={16} style={styles.selectedIcon} />
              )}
              <TextHeader color={colors.secondPrimary} numberOfLines={1} style={styles.textHeader} ellipsizeMode='tail'>
                My workouts
              </TextHeader>
            </Card>
          </TouchableOpacity>
        ) : null}
        {plans.map((plan, idx) => {
          const isCurrent = isInPlan ? selectedPlan.uid === plan.uid : false
          const color = COLORS_EXERCISE[plan?.colorIdx === undefined ? 3 : plan?.colorIdx][+isDark]
          return isCurrent ? null : (
            <TouchableOpacity key={plan.uid} onPress={() => setSelectedIdx(idx)}>
              <Card style={[styles.plan, { borderLeftColor: color, borderLeftWidth: 3 }]}>
                {idx === selectedIdx && (
                  <Icon name={icon.checkCircle} color={colors.primary} size={16} style={styles.selectedIcon} />
                )}
                <TextHeader color={color} numberOfLines={1} style={styles.textHeader} ellipsizeMode='tail'>
                  {plan.name}
                </TextHeader>
                <TextSecondary>Workouts: {plan?.workouts?.length || 0}</TextSecondary>
              </Card>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </AppModal>
  )
})
