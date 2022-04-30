import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { defaultWorkout } from '../../Utils/constants'
import { WorkoutType } from '../../Utils/types'
import { AddMoreButton, AppModal, MyTextInput } from '../../Common'
import { FlexCenterColumn } from '../../Theme/Parents'
import { useUser } from '../../Hooks/redux'

const initialName = 'New workout'

interface ICreateWorkout {
  onAddWorkout: (newWorkout: WorkoutType) => void
}

export default memo(function CreateWorkout({ onAddWorkout }: ICreateWorkout) {
  const [isNewWorkoutModal, setIsNewWorkoutModal] = useState(false)
  const [workoutName, setWorkoutName] = useState<string>(initialName)
  const { user } = useUser()

  const onCreateWorkout = useCallback(() => {
    onAddWorkout({ ...defaultWorkout, name: workoutName, ownerUid: user.uid })
  }, [user, workoutName])

  return (
    <>
      <AddMoreButton onPress={() => setIsNewWorkoutModal(true)} header={'Workout'} />
      <AppModal
        isOpen={isNewWorkoutModal}
        header={'Create new Workout?'}
        confirmText={'Yes, Create'}
        onConfirm={onCreateWorkout}
        onClose={() => {
          setWorkoutName(initialName)
          setIsNewWorkoutModal(false)
        }}
      >
        <FlexCenterColumn>
          <MyTextInput
            autoFocus
            placeholder={'Workout name'}
            onChangeText={setWorkoutName}
            value={workoutName}
            type={'underline'}
          />
        </FlexCenterColumn>
      </AppModal>
    </>
  )
})
