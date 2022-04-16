import React, { useEffect } from 'react'
import { WorkoutsScreen } from '../index'
import { useAppDispatch, useUser } from '../../Hooks/redux'
import { workoutActionCreators } from '../../store/WorkoutReducer/WorkoutActionCreators'


export default function MyWorkoutsScreen() {
  const { user } = useUser()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!user?.uid) return
    dispatch(workoutActionCreators.getWorkouts({uid: user.uid, findBy: 'ownerUid' }))
  }, [])

  return (
    <>
      <WorkoutsScreen />
    </>
  )
}