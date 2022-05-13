export interface StoredFile {
  fileName: string
  storageKey: string
  downloadUrl: string
}

export type FilterType = 'home' | 'gym' | 'street'

export type StoredExerciseImage = StoredFile & { filter: FilterType }
