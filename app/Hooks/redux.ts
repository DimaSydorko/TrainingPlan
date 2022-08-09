import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { PlansSliceType } from '../store/PlansReducer/PlansSlice'
import { SettingsSliceType } from '../store/SettingsReducer/SettingsSlice'
import { WorkoutSliceType } from '../store/WorkoutReducer/WorkoutSlice'
import { UserSliceType } from '../store/UserReducer/UserSlice'
import { PublicationsSliceType } from '../store/PublicationsReducer/PublicationsSlice'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useUser = () => useAppSelector(state => state.userReducer) as UserSliceType
export const usePlans = () => useAppSelector(state => state.plansReducer) as PlansSliceType
export const useWorkout = () => useAppSelector(state => state.workoutReducer) as WorkoutSliceType
export const useSettings = () => useAppSelector(state => state.settingsReducer) as SettingsSliceType
export const usePublications = () => useAppSelector(state => state.publicationsReducer) as PublicationsSliceType
