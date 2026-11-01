import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PlanType, WorkoutType } from '@utils/types'
import { LEGACY_PERSIST_ROOT_KEY, LEGACY_PLANS_SLICE_KEY, LEGACY_WORKOUT_SLICE_KEY } from './legacy-import.constants'

type LegacyWorkoutSlice = { workouts?: WorkoutType[]; sortedWorkoutUids?: string[] } | null
type LegacyPlansSlice = { plans?: PlanType[] } | null

export type LegacyData = { workouts: WorkoutType[]; plans: PlanType[] }

const EMPTY_LEGACY_DATA: LegacyData = { workouts: [], plans: [] }

const parseSlice = <T>(legacyRoot: Record<string, string | undefined>, key: string): T | null => {
  const rawSlice = legacyRoot[key]
  return rawSlice ? (JSON.parse(rawSlice) as T) : null
}

const sortByLegacyOrder = (workouts: WorkoutType[], sortedUids: string[]) =>
  workouts.slice().sort((a, b) => sortedUids.indexOf(a.uid) - sortedUids.indexOf(b.uid))

export const parseLegacyData = (rawLegacyRoot: string | null): LegacyData => {
  if (!rawLegacyRoot) return EMPTY_LEGACY_DATA

  try {
    const legacyRoot = JSON.parse(rawLegacyRoot) as Record<string, string | undefined>
    const workoutSlice = parseSlice<LegacyWorkoutSlice>(legacyRoot, LEGACY_WORKOUT_SLICE_KEY)
    const plansSlice = parseSlice<LegacyPlansSlice>(legacyRoot, LEGACY_PLANS_SLICE_KEY)

    return {
      workouts: sortByLegacyOrder(workoutSlice?.workouts ?? [], workoutSlice?.sortedWorkoutUids ?? []),
      plans: plansSlice?.plans ?? [],
    }
  } catch {
    return EMPTY_LEGACY_DATA
  }
}

export const getLegacyData = async (): Promise<LegacyData> =>
  parseLegacyData(await AsyncStorage.getItem(LEGACY_PERSIST_ROOT_KEY))
