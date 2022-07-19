import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { TouchableOpacity, Vibration } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { changePlansPosition, selectPlan } from '../../store/PlansReducer/PlansSlice'
import { plansActionCreators } from '../../store/PlansReducer/PlansActionCreators'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'
import { useAppDispatch, usePlans } from '../../Hooks/redux'
import { AppHeader, Card, FlexEnd, FlexStart, Page, TextHeader } from '../../Theme/Parents'
import { AddMoreButton, AppModal, IconButton } from '../../Common'
import EditPlanWorkout from '../../Components/EditPlanWorkout/EditPlanWorkout'
import PlanCard from './PlanCard'
import { ScreenName, VIBRATION } from '../../Utils/constants'
import { PlanType } from '../../Utils/types'
import { icon } from '../../Theme/icons'

export default memo(function MyPlansScreen() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const dispatch = useAppDispatch()
  const statePlans = usePlans()
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
      if (isNewPlanModal) dispatch(plansActionCreators.addPlan(newPlan))
      else dispatch(plansActionCreators.updatePlan(newPlan))
    },
    [isNewPlanModal]
  )

  const onPlanPress = (plan: PlanType) => {
    if (isEditMode) {
      setSelectedPlanUids(p => (p.includes(plan.uid) ? p.filter(p => p !== plan.uid) : [...p, plan.uid]))
    } else {
      dispatch(selectPlan(plan))
      dispatch(workoutActionCreators.getWorkouts({ uid: plan.uid, findBy: 'planUid' }))
      navigation.navigate(ScreenName.Plan)
    }
  }

  const onDelete = () => {
    setSelectedPlanUids([])
    selectedPlanUids.forEach(uid => dispatch(plansActionCreators.deletePlan(uid)))
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PlanType>) => (
    <ScaleDecorator>
      <Card>
        <TouchableOpacity
          onLongPress={() => {
            Vibration.vibrate(VIBRATION.BUTTON)
            !!selectedPlanUids.length ? drag() : setSelectedPlanUids([item.uid])
          }}
          onPress={() => onPlanPress(item)}
          disabled={isActive}
        >
          <PlanCard plan={item} isSelected={selectedPlanUids.includes(item.uid)} />
        </TouchableOpacity>
      </Card>
    </ScaleDecorator>
  )

  return (
    <>
      {isEditMode && (
        <AppHeader>
          <FlexStart>
            <IconButton iconName={icon.close} onPress={() => setSelectedPlanUids([])} />
            <TextHeader>{selectedPlanUids.length}</TextHeader>
          </FlexStart>
          <FlexEnd>
            {selectedPlanUids.length === 1 && (
              <IconButton
                margin={10}
                iconName={icon.edit}
                onPress={() => setChangePlan(plans.find(plan => plan.uid === selectedPlanUids[0]))}
              />
            )}
            <IconButton iconName={icon.delete} onPress={() => setIsDeleteModal(true)} />
          </FlexEnd>
        </AppHeader>
      )}
      <Page>
        <NestableScrollContainer>
          <NestableDraggableFlatList
            data={plans}
            renderItem={renderItem}
            keyExtractor={item => item.uid}
            onDragEnd={({ data }) => dispatch(changePlansPosition(data.map(plan => plan.uid)))}
          />
        </NestableScrollContainer>
      </Page>
      <AddMoreButton onPress={() => setIsNewPlanModal(true)} />
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
