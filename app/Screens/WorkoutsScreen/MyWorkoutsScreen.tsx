import * as React from 'react'
import { useEffect } from 'react'
import { WorkoutsScreen } from '../index'
import { useAppDispatch, useUser } from '../../Hooks/redux'
import { workoutAC } from '../../store/WorkoutReducer/WorkoutActionCreators'

export default function MyWorkoutsScreen() {
  const { user } = useUser()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!user?.uid) return
    dispatch(workoutAC.getWorkouts({ uid: user.uid, findBy: 'ownerUid' }))
  }, [])

  return <WorkoutsScreen />
}
