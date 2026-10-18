import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LikeToggleType, publicationsAC } from './publications-ac'
import { PublicType } from '@utils/types'

export interface PublicationsSliceType {
  publications: PublicType[]
  userPublications: PublicType[]
  isPublicationsAll: boolean
  isUserPublicationsAll: boolean
  isLoading: boolean
  error: string
}

const initialState: PublicationsSliceType = {
  publications: [],
  userPublications: [],
  isPublicationsAll: false,
  isUserPublicationsAll: false,
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
  extraReducers: builder => {
    builder
      .addCase(
        publicationsAC.get.fulfilled.type,
        (state, { payload }: PayloadAction<{ publications: PublicType[]; isYours: boolean; isNextChunk: boolean }>) => {
          if (payload.isYours) {
            if (payload.isNextChunk) {
              const newPublications = [
                ...state.userPublications,
                ...payload.publications.filter(p => !state.userPublications.find(prev => prev.uid === p.uid)),
              ]
              // All loaded when a next chunk brings nothing new (was `<=`, which was always true and
              // stopped pagination after the second page).
              state.isUserPublicationsAll = newPublications.length === state.userPublications.length
              state.userPublications = newPublications
            } else {
              state.userPublications = payload.publications
              state.isUserPublicationsAll = false
            }
          } else {
            if (payload.isNextChunk) {
              const newPublications = [
                ...state.publications,
                ...payload.publications.filter(p => !state.publications.find(prev => prev.uid === p.uid)),
              ]
              state.isPublicationsAll = newPublications.length === state.publications.length
              state.publications = newPublications
            } else {
              state.publications = payload.publications
              state.isPublicationsAll = false
            }
          }
          state.isLoading = false
          state.error = ''
        }
      )
      .addCase(publicationsAC.add.fulfilled.type, (state, { payload }: PayloadAction<PublicType>) => {
        state.publications.unshift(payload)
        state.userPublications.unshift(payload)
        state.isLoading = false
        state.error = ''
      })
      .addCase(
        publicationsAC.likeToggle.fulfilled.type,
        (
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
        }
      )
      .addCase(
        publicationsAC.save.fulfilled.type,
        (state, { payload }: PayloadAction<{ userUid: string; publicationUid: string } | null>) => {
          // payload is null when the user had already downloaded it (destructuring it used to throw)
          if (payload?.publicationUid) {
            const { userUid, publicationUid } = payload
            state.publications = state.publications.map(p =>
              p.uid === publicationUid ? { ...p, downloads: [...p.downloads, userUid] } : p
            )
            state.userPublications = state.userPublications.map(p =>
              p.uid === publicationUid ? { ...p, downloads: [...p.downloads, userUid] } : p
            )
          }
          state.isLoading = false
          state.error = ''
        }
      )
      .addCase(publicationsAC.delete.fulfilled.type, (state, { payload }: PayloadAction<string>) => {
        state.userPublications = state.userPublications.filter(p => payload !== p.uid)
        state.publications = state.publications.filter(p => payload !== p.uid)
        state.isLoading = false
        state.error = ''
      })
      .addCase(publicationsAC.get.pending.type, onLoading)
      .addCase(publicationsAC.add.pending.type, onLoading)
      .addCase(publicationsAC.get.rejected.type, onError)
      .addCase(publicationsAC.add.rejected.type, onError)
      .addCase(publicationsAC.delete.rejected.type, onError)
      .addCase(publicationsAC.likeToggle.rejected.type, onError)
  },
})
export const { errorPublicationClear, clearPublicationResults } = publicationsSlice.actions
export default publicationsSlice.reducer
