import * as React from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
import { useSettings, useUser } from '../../Hooks/redux'
import { defaultPlan, defaultWorkout } from '../../Utils/constants'
import { PlanType, WorkoutType } from '../../Utils/types'
import { AppModal, LabelsInput, MyTextInput } from '../../Common'
import { FlexCenterColumn } from '../../Theme/Parents'

interface IEditPlanWorkout {
  isModal: boolean
  type: 'Plan' | 'Workout'
  initialValue?: WorkoutType | PlanType
  onClose: () => void
  onSubmit: (newItem: PlanType | WorkoutType) => void
}

export default memo(function EditPlanWorkout({ onSubmit, type, isModal, onClose, initialValue }: IEditPlanWorkout) {
  const { user } = useUser()
  const isNew = !initialValue
  const initialName = useMemo(() => (isNew ? `New_${type}` : initialValue.name), [])
  const initialLabels = useMemo(() => (isNew ? [] : initialValue.labels), [])
  const [name, setName] = useState<string>(initialName)
  const [labels, setLabels] = useState<string[]>(initialLabels)

  const onConfirm = useCallback(() => {
    if (isNew) {
      const newItem = { ...(type === 'Plan' ? defaultPlan : defaultWorkout), name, ownerUid: user.uid, labels }
      onSubmit(newItem)
    } else {
      onSubmit({ ...initialValue, name, labels })
    }
  }, [user, name, initialValue, isNew, labels])

  const onCloseModal = useCallback(() => {
    setName(initialName)
    setLabels(initialLabels)
    onClose()
  }, [onClose, initialName, initialLabels])

  return (
    <AppModal
      isOpen={isModal}
      header={`${isNew ? 'Create new' : 'Update'} ${type}?`}
      confirmText={`Yes, ${isNew ? 'Create' : 'Save'}`}
      onConfirm={onConfirm}
      onClose={onCloseModal}
    >
      <FlexCenterColumn>
        <MyTextInput placeholder={`${type} name`} onChangeText={setName} value={name} type={'underline'} />
        <LabelsInput labels={labels} setLabels={setLabels} />
      </FlexCenterColumn>
    </AppModal>
  )
})
