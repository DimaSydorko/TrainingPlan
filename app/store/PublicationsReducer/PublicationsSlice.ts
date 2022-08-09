import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LikeToggleType, publicationsAC } from './PublicationsAC'
import { PublicType } from '../../Utils/types'

export interface PublicationsSliceType {
  publications: PublicType[]
  userPublications: PublicType[]
  isLoading: boolean
  error: string
}

const initialState: PublicationsSliceType = {
  publications: [],
  userPublications: [],
  isLoading: false,
  error: '',
}

const onError = (state: PublicationsSliceType, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = `Publications ${payload}`
}

const onLoading = (state: PublicationsSliceType) => {
  state.isLoading = true
}

export const publicationsSlice = createSlice({
  name: 'publications',
  initialState,
  reducers: {
    errorPublicationClear(state) {
      state.error = ''
    },
    clearPublicationResults(state) {
      state.error = ''
      state.isLoading = false
      state.publications = initialState.publications
      state.userPublications = initialState.userPublications
    },
  },
  extraReducers: {
    [publicationsAC.get.fulfilled.type]: (
      state,
      { payload }: PayloadAction<{ publications: PublicType[]; isYours: boolean }>
    ) => {
      if (payload.isYours) {
        state.userPublications = payload.publications
      } else {
        state.publications = payload.publications
      }
      state.isLoading = false
      state.error = ''
    },
    [publicationsAC.add.fulfilled.type]: (state, { payload }: PayloadAction<PublicType>) => {
      state.publications.unshift(payload)
      state.userPublications.unshift(payload)
      state.isLoading = false
      state.error = ''
    },
    [publicationsAC.likeToggle.fulfilled.type]: (
      state,
      { payload: { userUid, publicationUid, isLiked } }: PayloadAction<LikeToggleType & { userUid: string }>
    ) => {
      state.publications = state.publications.map(p =>
        p.uid === publicationUid
          ? {
              ...p,
              likes: isLiked ? p.likes.filter(l => l !== userUid) : [...p.likes, userUid],
            }
          : p
      )
      state.isLoading = false
      state.error = ''
    },
    [publicationsAC.save.fulfilled.type]: (
      state,
      { payload: { userUid, publicationUid } }: PayloadAction<{ userUid: string; publicationUid: string } | null>
    ) => {
      if (publicationUid) {
        state.publications = state.publications.map(p =>
          p.uid === publicationUid ? { ...p, downloads: [...p.downloads, userUid] } : p
        )
        state.userPublications = state.publications.map(p =>
          p.uid === publicationUid ? { ...p, downloads: [...p.downloads, userUid] } : p
        )
      }
      state.isLoading = false
      state.error = ''
    },
    [publicationsAC.delete.fulfilled.type]: (state, { payload }: PayloadAction<string>) => {
      state.userPublications = state.userPublications.filter(p => payload !== p.uid)
      state.publications = state.publications.filter(p => payload !== p.uid)
      state.isLoading = false
      state.error = ''
    },
    [publicationsAC.get.pending.type]: onLoading,
    [publicationsAC.add.pending.type]: onLoading,

    [publicationsAC.get.rejected.type]: onError,
    [publicationsAC.add.rejected.type]: onError,
    [publicationsAC.delete.rejected.type]: onError,
    [publicationsAC.likeToggle.rejected.type]: onError,
  },
})
export const { errorPublicationClear, clearPublicationResults } = publicationsSlice.actions
export default publicationsSlice.reducer
