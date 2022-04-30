import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { defaultPlan } from '../../Utils/constants'
import { PlanType } from '../../Utils/types'
import { AddMoreButton, AppModal, MyTextInput } from '../../Common'
import { FlexCenterColumn } from '../../Theme/Parents'
import { useUser } from '../../Hooks/redux'

const initialName = 'New plan'

interface ICreatePlane {
  onAddPlan: (newPlan: PlanType) => void
}

export default memo(function CreatePlan({ onAddPlan }: ICreatePlane) {
  const [isModal, setModal] = useState(false)
  const [planName, setPlanName] = useState<string>(initialName)
  const { user } = useUser()

  const onCreatePlan = useCallback(() => {
    onAddPlan({ ...defaultPlan, name: planName, ownerUid: user.uid })
  }, [user, planName])

  return (
    <>
      <AddMoreButton onPress={() => setModal(true)} header={'Plan'} />
      <AppModal
        isOpen={isModal}
        header={'Create new Plan?'}
        confirmText={'Yes, Create'}
        onConfirm={onCreatePlan}
        onClose={() => {
          setPlanName(initialName)
          setModal(false)
        }}
      >
        <FlexCenterColumn>
          <MyTextInput
            autoFocus
            placeholder={'Plan name'}
            onChangeText={setPlanName}
            value={planName}
            type={'underline'}
          />
        </FlexCenterColumn>
      </AppModal>
    </>
  )
})
