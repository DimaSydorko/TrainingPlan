export const PLANS_TABLE = 'plans'
export const PLAN_COLUMNS =
  'id, owner_id, name, color_idx, labels, updated_at, plan_workouts(position, workouts(id, owner_id, name, color_idx, labels, updated_at, source_workout_id, workout_exercises(id, position, laps, rest_sec, is_visible, color_idx, sets, exercises(id, name, metric))))'
