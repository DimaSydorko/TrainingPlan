import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { TouchableOpacity, Vibration } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { changePlansPosition, selectPlan } from '@store/plans-reducer/plans-slice'
import { plansAC } from '@store/plans-reducer/plans-ac'
import { useAppDispatch, usePlans } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import AppHeader from '@common/app-header/app-header'
import Card from '@common/card/card'
import Stack from '@common/stack/stack'
import Screen from '@common/screen/screen'
import AppText from '@common/app-text/app-text'
import {
  AddMoreButton,
  AppModal,
  DraggableItem,
  DraggableList,
  DraggableRenderItemParams,
  DraggableScrollContainer,
  IconButton,
} from '@common'
import EditPlanWorkout from '@components/edit-plan-workout/edit-plan-workout'
import PlanCard from './plan-card'
import { QUERY_LIMIT, ScreenName, VIBRATION } from '@utils/constants'
import { PlanType, PlansNavigation } from '@utils/types'
import { icon } from '@theme/icons'
import { getExerciseColor } from '@theme/tokens'
import NoDataIcon from '@assets/icons/no-data-icon'
import styles from './my-plans-screen.styles'

export default memo(function MyPlansScreen() {
  const navigation = useNavigation<PlansNavigation>()
  const dispatch = useAppDispatch()
  const statePlans = usePlans()
  const { isDark } = useAppTheme()
  const [selectedPlanUids, setSelectedPlanUids] = useState<string[]>([])
  const [isNewPlanModal, setIsNewPlanModal] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const [changePlan, setChangePlan] = useState<PlanType | null>(null)
  const isEditMode = !!selectedPlanUids.length
  const plans = statePlans.plans
    ?.slice()
    ?.sort((a, b) => (statePlans.sortedPlanUids.indexOf(a.uid) || 0) - statePlans.sortedPlanUids.indexOf(b.uid) || 0)

  const onAddPlan = useCallback(
    (newPlan: PlanType) => {
      if (isNewPlanModal) dispatch(plansAC.addPlan(newPlan))
      else {
        setSelectedPlanUids([])
        dispatch(plansAC.updatePlan(newPlan))
      }
    },
    [isNewPlanModal]
  )

  const onPlanPress = (plan: PlanType) => {
    if (isEditMode) {
      setSelectedPlanUids(p => (p.includes(plan.uid) ? p.filter(p => p !== plan.uid) : [...p, plan.uid]))
    } else {
      dispatch(selectPlan(plan))
      navigation.navigate(ScreenName.Plan)
    }
  }

  const onDelete = () => {
    setSelectedPlanUids([])
    selectedPlanUids.forEach(uid => dispatch(plansAC.deletePlan(uid)))
  }

  const renderItem = ({ item, drag, isActive }: DraggableRenderItemParams<PlanType>) => {
    const color = getExerciseColor(item?.colorIdx === undefined ? 3 : item?.colorIdx, isDark)
    return (
      <DraggableItem>
        <Card borderLeftColor={color}>
          <TouchableOpacity
            onLongPress={() => {
              Vibration.vibrate(VIBRATION.BUTTON)
              if (selectedPlanUids.length) drag()
              else setSelectedPlanUids([item.uid])
            }}
            onPress={() => onPlanPress(item)}
            disabled={isActive}
          >
            <PlanCard color={color} plan={item} isSelected={selectedPlanUids.includes(item.uid)} />
          </TouchableOpacity>
        </Card>
      </DraggableItem>
    )
  }

  return (
    <>
      {isEditMode && (
        <AppHeader style={styles.header}>
          <Stack preset='start'>
            <IconButton iconName={icon.close} onPress={() => setSelectedPlanUids([])} />
            <AppText variant='title'>{selectedPlanUids.length}</AppText>
            {plans.length > selectedPlanUids.length && (
              <IconButton
                margin={10}
                iconName={icon.checkAll}
                onPress={() => setSelectedPlanUids(plans.map(p => p.uid))}
              />
            )}
          </Stack>
          <Stack preset='end' style={styles.headerActions}>
            {selectedPlanUids.length === 1 && (
              <IconButton
                margin={10}
                iconName={icon.edit}
                onPress={() => setChangePlan(plans.find(plan => plan.uid === selectedPlanUids[0]))}
              />
            )}
            <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />
          </Stack>
        </AppHeader>
      )}
      <Screen>
        {plans?.length === 0 && <NoDataIcon />}
        <DraggableScrollContainer>
          <DraggableList
            data={plans}
            renderItem={renderItem}
            keyExtractor={item => item.uid}
            onDragEnd={({ data }) => dispatch(changePlansPosition(data.map(plan => plan.uid)))}
          />
        </DraggableScrollContainer>
      </Screen>
      {plans?.length <= QUERY_LIMIT && <AddMoreButton onPress={() => setIsNewPlanModal(true)} />}
      {(isNewPlanModal || !!changePlan) && (
        <EditPlanWorkout
          isModal
          type={'Plan'}
          initialValue={changePlan}
          onSubmit={onAddPlan}
          onClose={() => (isNewPlanModal ? setIsNewPlanModal(false) : setChangePlan(null))}
        />
      )}
      <AppModal
        isWarning
        header={`Delete plan${selectedPlanUids.length === 1 ? '' : 's'}`}
        text={`Are you sure you want to delete ${
          selectedPlanUids.length === 1
            ? `'${plans.find(plan => plan.uid === selectedPlanUids[0]).name}'`
            : selectedPlanUids.length
        } plan${selectedPlanUids.length === 1 ? '' : 's'}?`}
        confirmText='Yes, delete'
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
        onConfirm={() => onDelete()}
      />
    </>
  )
})
