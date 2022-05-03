import * as React from 'react'
import { Text, View } from 'react-native'
import { useAppDispatch } from '../../Hooks/redux'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import { clearPlaneResults } from '../../store/PlansReducer/PlansSlice'
import { clearWorkoutResults } from '../../store/WorkoutReducer/WorkoutSlice'
import { clearPlayingResults } from '../../store/PlayingReduser/PlayingSlice'
import { ConfirmButton } from '../../Common'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'

export default function EmptyScreen() {
  const dispatch = useAppDispatch()

  const signOut = () => {
    dispatch(userActionCreators.signOut())
  }

  const clearAll = () => {
    dispatch(clearWorkoutResults())
    dispatch(clearPlaneResults())
    dispatch(clearPlayingResults())
  }

  return (
    <View style={[theme.containers.centerColumn, theme.view.background]}>
      <Text>EmptyScreen</Text>
      <ConfirmButton header={'Sign out'} onPress={signOut} />
      <ConfirmButton header={'Clear storage'} color={colors.secondPrimary} onPress={clearAll} />
    </View>
  )
}
