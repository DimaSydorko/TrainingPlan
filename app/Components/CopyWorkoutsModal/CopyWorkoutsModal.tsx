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

interface PropsType {
  isOpen: boolean
  onClose: () => void
  workoutUid: string
  onCopy: (plans: PlanType[]) => void
}

export default memo(function CopyWorkoutsModal({ onClose, onCopy, isOpen, workoutUid }: PropsType) {
  const { plans } = usePlans()
  const { colors } = useSettings()
  const [selectedPlanUids, setSelectedPlanUids] = useState<string[]>([])

  const onConfirmCopy = useCallback(() => {
    onCopy(plans.filter(plan => selectedPlanUids.includes(plan.uid)))
  }, [selectedPlanUids, onCopy])

  const onWorkoutPress = (planUid: string) => {
    setSelectedPlanUids(p => (p.includes(planUid) ? p.filter(p => p !== planUid) : [...p, planUid]))
  }

  const onRefuse = useCallback(() => {
    onClose()
    setSelectedPlanUids([])
  }, [])

  return (
    <AppModal onConfirm={onConfirmCopy} confirmText='Copy' onClose={onRefuse} isOpen={isOpen} header={'Copy workout'}>
      <ScrollView style={styles.container}>
        {plans.map(plan => {
          const isDisabled = plan.workoutUids.includes(workoutUid)
          return (
            <TouchableOpacity key={plan.uid} disabled={isDisabled} onPress={() => onWorkoutPress(plan.uid)}>
              <Card style={[styles.plan, { opacity: isDisabled ? 0.8 : 1 }]}>
                {(selectedPlanUids.includes(plan.uid) || isDisabled) && (
                  <Icon name={icon.checkCircle} color={colors.primary} size={16} style={styles.selectedIcon} />
                )}
                <TextHeader
                  color={isDisabled ? colors.disabled : colors.secondPrimary}
                  numberOfLines={1}
                  style={styles.textHeader}
                  ellipsizeMode='tail'
                >
                  {plan.name}
                </TextHeader>
                <TextSecondary>Workouts: {plan.workoutUids.length}</TextSecondary>
              </Card>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </AppModal>
  )
})
