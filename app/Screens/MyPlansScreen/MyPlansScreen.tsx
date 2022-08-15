import * as React from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
import { TouchableOpacity, Vibration } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { changePlansPosition, selectPlan } from '../../store/PlansReducer/PlansSlice'
import { plansAC } from '../../store/PlansReducer/PlansAC'
import { publicationsAC } from '../../store/PublicationsReducer/PublicationsAC'
import { useAppDispatch, usePlans, useSettings } from '../../Hooks/redux'
import { AppHeader, Card, FlexEnd, FlexStart, Page, TextHeader } from '../../Theme/Parents'
import { AddMoreButton, AppModal, IconButton } from '../../Common'
import EditPlanWorkout from '../../Components/EditPlanWorkout/EditPlanWorkout'
import PlanCard from './PlanCard'
import { QUERY_LIMIT, ScreenName, VIBRATION } from '../../Utils/constants'
import { AppNavigationType, PlanType } from '../../Utils/types'
import { icon } from '../../Theme/icons'
import ShareModal from '../../Components/ShareModal/ShareModal'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'

export default memo(function MyPlansScreen() {
  const navigation = useNavigation<AppNavigationType>()
  const dispatch = useAppDispatch()
  const statePlans = usePlans()
  const { colors } = useSettings()
  const [selectedPlanUids, setSelectedPlanUids] = useState<string[]>([])
  const [isNewPlanModal, setIsNewPlanModal] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const [isShareModal, setIsShareModal] = useState(false)
  const [changePlan, setChangePlan] = useState<PlanType | null>(null)
  const isEditMode = !!selectedPlanUids.length
  const isDarkTheme = colors.primary === colorsDark.primary
  const plans = statePlans.plans
    ?.slice()
    ?.sort((a, b) => (statePlans.sortedPlanUids.indexOf(a.uid) || 0) - statePlans.sortedPlanUids.indexOf(b.uid) || 0)
  const selectedFirst = useMemo(
    () => plans.find(workout => workout.uid === selectedPlanUids[0]),
    [plans, selectedPlanUids[0]]
  )

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

  const onShare = useCallback(() => {
    dispatch(publicationsAC.add(selectedFirst))
    setSelectedPlanUids([])
  }, [selectedFirst])

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PlanType>) => {
    const color = COLORS_EXERCISE[item?.colorIdx || 3][+isDarkTheme]
    return (
      <ScaleDecorator>
        <Card borderLeftColor={color}>
          <TouchableOpacity
            onLongPress={() => {
              Vibration.vibrate(VIBRATION.BUTTON)
              !!selectedPlanUids.length ? drag() : setSelectedPlanUids([item.uid])
            }}
            onPress={() => onPlanPress(item)}
            disabled={isActive}
          >
            <PlanCard color={color} plan={item} isSelected={selectedPlanUids.includes(item.uid)} />
          </TouchableOpacity>
        </Card>
      </ScaleDecorator>
    )
  }

  return (
    <>
      {isEditMode && (
        <AppHeader style={{ justifyContent: 'space-between' }}>
          <FlexStart>
            <IconButton iconName={icon.close} onPress={() => setSelectedPlanUids([])} />
            <TextHeader>{selectedPlanUids.length}</TextHeader>
            {plans.length > selectedPlanUids.length && (
              <IconButton
                margin={10}
                iconName={icon.checkAll}
                onPress={() => setSelectedPlanUids(plans.map(p => p.uid))}
              />
            )}
          </FlexStart>
          <FlexEnd style={{ width: 250 }}>
            {selectedPlanUids.length === 1 && (
              <IconButton iconName={icon.share} onPress={() => setIsShareModal(true)} />
            )}
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
      <ShareModal isOpen={isShareModal} onShare={onShare} onClose={() => setIsShareModal(false)} plan={selectedFirst} />
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
