export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }

  public: {
    Tables: {
      body_weights: {
        Row: {
          created_at: string
          id: string
          measured_on: string
          updated_at: string
          user_id: string
          weight_kg: number
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          measured_on?: string
          updated_at?: string
          user_id?: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          measured_on?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: 'body_weights_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      exercise_images: {
        Row: {
          created_at: string
          file_name: string
          filter: string
          id: string
          owner_id: string | null
          storage_path: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          file_name?: string
          filter?: string
          id?: string
          owner_id?: string | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          filter?: string
          id?: string
          owner_id?: string | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exercise_images_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      exercise_muscles: {
        Row: {
          exercise_id: string
          muscle_id: string
          weight: number
        }
        ComputedFields: never
        Insert: {
          exercise_id: string
          muscle_id: string
          weight: number
        }
        Update: {
          exercise_id?: string
          muscle_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: 'exercise_muscles_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercise_muscles_muscle_id_fkey'
            columns: ['muscle_id']
            isOneToOne: false
            referencedRelation: 'muscles'
            referencedColumns: ['id']
          }
        ]
      }
      exercise_session_stats: {
        Row: {
          best_e1rm: number | null
          completion_ratio: number | null
          exercise_id: string
          hard_sets: number
          max_hold_sec: number | null
          max_reps: number | null
          performed_at: string
          session_id: string
          skipped_sets: number
          top_reps: number | null
          top_weight: number | null
          total_sets: number
          user_id: string
          volume: number
        }
        ComputedFields: never
        Insert: {
          best_e1rm?: number | null
          completion_ratio?: number | null
          exercise_id: string
          hard_sets?: number
          max_hold_sec?: number | null
          max_reps?: number | null
          performed_at: string
          session_id: string
          skipped_sets?: number
          top_reps?: number | null
          top_weight?: number | null
          total_sets?: number
          user_id: string
          volume?: number
        }
        Update: {
          best_e1rm?: number | null
          completion_ratio?: number | null
          exercise_id?: string
          hard_sets?: number
          max_hold_sec?: number | null
          max_reps?: number | null
          performed_at?: string
          session_id?: string
          skipped_sets?: number
          top_reps?: number | null
          top_weight?: number | null
          total_sets?: number
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: 'exercise_session_stats_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercise_session_stats_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'workout_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercise_session_stats_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      exercises: {
        Row: {
          archived_at: string | null
          based_on_exercise_id: string | null
          complexity: number | null
          created_at: string
          id: string
          image_id: string | null
          is_per_hand: boolean
          metric: string
          name: string
          owner_id: string | null
          pattern_id: string | null
          pattern_load_ratio: number | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          based_on_exercise_id?: string | null
          complexity?: number | null
          created_at?: string
          id?: string
          image_id?: string | null
          is_per_hand?: boolean
          metric?: string
          name: string
          owner_id?: string | null
          pattern_id?: string | null
          pattern_load_ratio?: number | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          based_on_exercise_id?: string | null
          complexity?: number | null
          created_at?: string
          id?: string
          image_id?: string | null
          is_per_hand?: boolean
          metric?: string
          name?: string
          owner_id?: string | null
          pattern_id?: string | null
          pattern_load_ratio?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exercises_based_on_exercise_id_fkey'
            columns: ['based_on_exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercises_image_id_fkey'
            columns: ['image_id']
            isOneToOne: false
            referencedRelation: 'exercise_images'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercises_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercises_pattern_id_fkey'
            columns: ['pattern_id']
            isOneToOne: false
            referencedRelation: 'movement_patterns'
            referencedColumns: ['id']
          }
        ]
      }
      movement_patterns: {
        Row: {
          id: string
          reference_exercise_id: string | null
        }
        ComputedFields: never
        Insert: {
          id: string
          reference_exercise_id?: string | null
        }
        Update: {
          id?: string
          reference_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'movement_patterns_reference_exercise_fk'
            columns: ['reference_exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          }
        ]
      }
      muscle_groups: {
        Row: {
          id: string
          sort: number
        }
        ComputedFields: never
        Insert: {
          id: string
          sort?: number
        }
        Update: {
          id?: string
          sort?: number
        }
        Relationships: []
      }
      muscles: {
        Row: {
          group_id: string
          id: string
          recovery_hours: number
          sort: number
        }
        ComputedFields: never
        Insert: {
          group_id: string
          id: string
          recovery_hours: number
          sort?: number
        }
        Update: {
          group_id?: string
          id?: string
          recovery_hours?: number
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: 'muscles_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'muscle_groups'
            referencedColumns: ['id']
          }
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          exercise_id: string
          kind: string
          session_id: string
          user_id: string
          value: number
        }
        ComputedFields: never
        Insert: {
          achieved_at: string
          exercise_id: string
          kind: string
          session_id: string
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          exercise_id?: string
          kind?: string
          session_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'personal_records_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'personal_records_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'workout_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'personal_records_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      plan_workouts: {
        Row: {
          plan_id: string
          position: number
          workout_id: string
        }
        ComputedFields: never
        Insert: {
          plan_id: string
          position: number
          workout_id: string
        }
        Update: {
          plan_id?: string
          position?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plan_workouts_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'plan_workouts_workout_id_fkey'
            columns: ['workout_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          }
        ]
      }
      plans: {
        Row: {
          color_idx: number
          created_at: string
          id: string
          labels: string[]
          name: string
          owner_id: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          color_idx?: number
          created_at?: string
          id?: string
          labels?: string[]
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Update: {
          color_idx?: number
          created_at?: string
          id?: string
          labels?: string[]
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plans_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          legacy_imported_at: string | null
          level_updated_at: string | null
          overall_level: string | null
          photo_url: string | null
          role: string
          sex: string | null
          training_experience: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          display_name?: string
          email?: string
          id: string
          legacy_imported_at?: string | null
          level_updated_at?: string | null
          overall_level?: string | null
          photo_url?: string | null
          role?: string
          sex?: string | null
          training_experience?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          legacy_imported_at?: string | null
          level_updated_at?: string | null
          overall_level?: string | null
          photo_url?: string | null
          role?: string
          sex?: string | null
          training_experience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      set_logs: {
        Row: {
          duration_sec: number | null
          exercise_id: string
          exercise_order: number
          id: string
          is_skipped: boolean
          lap_no: number
          logged_at: string
          planned_duration_sec: number | null
          planned_reps: number | null
          planned_rest_sec: number | null
          planned_weight: number | null
          reps: number | null
          rest_sec: number | null
          session_id: string
          user_id: string
          weight: number | null
          workout_exercise_id: string | null
        }
        ComputedFields: never
        Insert: {
          duration_sec?: number | null
          exercise_id: string
          exercise_order?: number
          id?: string
          is_skipped?: boolean
          lap_no: number
          logged_at?: string
          planned_duration_sec?: number | null
          planned_reps?: number | null
          planned_rest_sec?: number | null
          planned_weight?: number | null
          reps?: number | null
          rest_sec?: number | null
          session_id: string
          user_id?: string
          weight?: number | null
          workout_exercise_id?: string | null
        }
        Update: {
          duration_sec?: number | null
          exercise_id?: string
          exercise_order?: number
          id?: string
          is_skipped?: boolean
          lap_no?: number
          logged_at?: string
          planned_duration_sec?: number | null
          planned_reps?: number | null
          planned_rest_sec?: number | null
          planned_weight?: number | null
          reps?: number | null
          rest_sec?: number | null
          session_id?: string
          user_id?: string
          weight?: number | null
          workout_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'set_logs_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'set_logs_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'workout_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'set_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'set_logs_workout_exercise_id_fkey'
            columns: ['workout_exercise_id']
            isOneToOne: false
            referencedRelation: 'workout_exercises'
            referencedColumns: ['id']
          }
        ]
      }
      strength_standards: {
        Row: {
          exercise_id: string
          level: string
          metric: string
          sex: string
          value: number
        }
        ComputedFields: never
        Insert: {
          exercise_id: string
          level: string
          metric: string
          sex: string
          value: number
        }
        Update: {
          exercise_id?: string
          level?: string
          metric?: string
          sex?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'strength_standards_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          }
        ]
      }
      user_exercise_levels: {
        Row: {
          confidence: number
          exercise_id: string
          level: string
          source: string
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          confidence: number
          exercise_id: string
          level: string
          source: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          exercise_id?: string
          level?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_exercise_levels_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_exercise_levels_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      workout_exercises: {
        Row: {
          color_idx: number
          created_at: string
          exercise_id: string
          id: string
          is_visible: boolean
          laps: number
          position: number
          rest_sec: number
          sets: NonNullable<Json>
          updated_at: string
          workout_id: string
        }
        ComputedFields: never
        Insert: {
          color_idx?: number
          created_at?: string
          exercise_id: string
          id?: string
          is_visible?: boolean
          laps?: number
          position: number
          rest_sec?: number
          sets?: NonNullable<Json>
          updated_at?: string
          workout_id: string
        }
        Update: {
          color_idx?: number
          created_at?: string
          exercise_id?: string
          id?: string
          is_visible?: boolean
          laps?: number
          position?: number
          rest_sec?: number
          sets?: NonNullable<Json>
          updated_at?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workout_exercises_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_exercises_workout_id_fkey'
            columns: ['workout_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          }
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string
          effort_rating: number | null
          finished_at: string | null
          id: string
          plan_id: string | null
          source: string
          started_at: string
          user_id: string
          workout_id: string | null
          workout_name: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          effort_rating?: number | null
          finished_at?: string | null
          id?: string
          plan_id?: string | null
          source?: string
          started_at?: string
          user_id?: string
          workout_id?: string | null
          workout_name?: string
        }
        Update: {
          created_at?: string
          effort_rating?: number | null
          finished_at?: string | null
          id?: string
          plan_id?: string | null
          source?: string
          started_at?: string
          user_id?: string
          workout_id?: string | null
          workout_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workout_sessions_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_sessions_workout_id_fkey'
            columns: ['workout_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          }
        ]
      }
      workouts: {
        Row: {
          color_idx: number
          created_at: string
          id: string
          in_library: boolean
          labels: string[]
          name: string
          owner_id: string
          source_workout_id: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          color_idx?: number
          created_at?: string
          id?: string
          in_library?: boolean
          labels?: string[]
          name?: string
          owner_id?: string
          source_workout_id?: string | null
          updated_at?: string
        }
        Update: {
          color_idx?: number
          created_at?: string
          id?: string
          in_library?: boolean
          labels?: string[]
          name?: string
          owner_id?: string
          source_workout_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workouts_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workouts_source_workout_id_fkey'
            columns: ['source_workout_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_plan: { Args: { p_plan_id: string }; Returns: undefined }
      estimate_e1rm: { Args: { p_reps: number; p_weight: number }; Returns: number }
      estimate_start_weight: {
        Args: { p_exercise_id: string }
        Returns: {
          discount: number
          e1rm: number
          source: string
          working_e1rm: number
        }[]
      }
      exercise_progress_for_period: {
        Args: { p_at: string; p_period_days: number }
        Returns: {
          change_pct: number
          current_best: number
          current_sessions: number
          exercise_id: string
          metric: string
          previous_best: number
          previous_sessions: number
          status: string
        }[]
      }
      finish_session: { Args: { p_session: Json; p_sets: Json }; Returns: Json }
      get_exercise_progress: {
        Args: { p_at?: string; p_period_days?: number }
        Returns: {
          change_pct: number
          current_best: number
          current_sessions: number
          exercise_id: string
          metric: string
          period_days: number
          previous_best: number
          previous_sessions: number
          status: string
        }[]
      }
      get_muscle_fatigue: {
        Args: { p_at?: string }
        Returns: {
          group_id: string
          last_trained_at: string
          muscle_id: string
          recovery_pct: number
          sets_7d: number
          sets_prev_7d: number
          trend: string
        }[]
      }
      get_muscle_progress: {
        Args: { p_at?: string; p_period_days?: number }
        Returns: {
          change_pct: number
          exercises_count: number
          group_id: string
          is_probably_fatigue: boolean
          muscle_id: string
          status: string
        }[]
      }
      import_legacy_data: { Args: { p_payload: Json }; Returns: Json }
      is_own_workout: { Args: { p_workout_id: string }; Returns: boolean }
      is_visible_exercise: { Args: { p_exercise_id: string }; Returns: boolean }
      legacy_uuid: { Args: { p_name: string }; Returns: string }
      legacy_workout_payload: {
        Args: { p_exercise_ids: Json; p_id: string; p_source_workout_id: string; p_workout: Json }
        Returns: Json
      }
      level_from_experience: { Args: { p_experience: string }; Returns: string }
      level_from_rank: { Args: { p_rank: number }; Returns: string }
      level_rank: { Args: { p_level: string }; Returns: number }
      period_days_for_level: { Args: { p_level: string }; Returns: number }
      recalc_levels: { Args: { p_user_id?: string }; Returns: undefined }
      refresh_personal_records: { Args: { p_exercise_ids: string[]; p_user_id: string }; Returns: undefined }
      save_plan: { Args: { p_plan: Json }; Returns: string }
      save_workout: { Args: { p_workout: Json }; Returns: string }
      upsert_workout_tree: { Args: { p_in_library: boolean; p_workout: Json }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
