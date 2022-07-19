import * as React from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
import { useUser } from '../../Hooks/redux'
import { defaultPlan, defaultWorkout } from '../../Utils/constants'
import { PlanType, WorkoutType } from '../../Utils/types'
import { AppModal, MyTextInput } from '../../Common'
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
  const [name, setName] = useState<string>(initialName)

  const onConfirm = useCallback(() => {
    if (isNew) {
      const newItem =
        type === 'Plan' ? { ...defaultPlan, name, ownerUid: user.uid } : { ...defaultWorkout, name, ownerUid: user.uid }
      onSubmit(newItem)
    } else {
      onSubmit({ ...initialValue, name })
    }
  }, [user, name, initialValue, isNew])

  return (
    <AppModal
      isOpen={isModal}
      header={`${isNew ? 'Create new' : 'Update'} ${type}?`}
      confirmText={`Yes, ${isNew ? 'Create' : 'Save'}`}
      onConfirm={onConfirm}
      onClose={() => {
        setName(initialName)
        onClose()
      }}
    >
      <FlexCenterColumn>
        <MyTextInput placeholder={`${type} name`} onChangeText={setName} value={name} type={'underline'} />
      </FlexCenterColumn>
    </AppModal>
  )
})
