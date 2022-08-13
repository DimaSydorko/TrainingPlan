import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { usePlans, useSettings } from '../../Hooks/redux'
import { AppModal } from '../../Common'
import { PlanType } from '../../Utils/types'
import { Card, TextHeader, TextSecondary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import styles from './styles'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'

interface PropsType {
  isOpen: boolean
  isInPlan: boolean
  onClose: () => void
  onCopy: (plan: PlanType | undefined) => void
}

export default memo(function CopyWorkoutsModal({ onClose, onCopy, isOpen, isInPlan }: PropsType) {
  const { plans, selectedPlan } = usePlans()
  const { colors } = useSettings()
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined)
  const isDarkTheme = colors.primary === colorsDark.primary

  const onConfirmCopy = useCallback(() => {
    setSelectedIdx(undefined)
    onCopy(plans.find((_, idx) => idx === selectedIdx))
  }, [onCopy, plans, selectedIdx])

  const onRefuse = useCallback(() => {
    onClose()
    setSelectedIdx(undefined)
  }, [onClose])

  return (
    <AppModal onConfirm={onConfirmCopy} confirmText='Copy' onClose={onRefuse} isOpen={isOpen} header={'Copy workout'}>
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
          const color = COLORS_EXERCISE[plan?.colorIdx || 3][+isDarkTheme]
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
