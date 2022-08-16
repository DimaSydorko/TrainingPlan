import * as React from 'react'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { useAppDispatch, usePublications, useSettings } from '../../Hooks/redux'
import { publicationsAC } from '../../store/PublicationsReducer/PublicationsAC'
import { InfiniteScroll, LabelsInput } from '../../Common'
import Publication from '../../Components/Publication/Publication'
import { deepCompare } from '../../Utils'
import { PUBLICATION_QUERY_LIMIT } from '../../Utils/constants'
import { TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'

export default function PublicationsScreen() {
  const dispatch = useAppDispatch()
  const { colors } = useSettings()
  const { publications, isLoading } = usePublications()
  const { internet } = useSettings()
  const [labels, setLabels] = useState<string[]>([])
  const [prevSearch, setPrevSearch] = useState<string[]>([])

  const searchByLabel = useCallback(
    (val?: string[]) => {
      const newVal = val || labels
      if (!deepCompare(prevSearch, newVal)) {
        setTimeout(() => {
          setPrevSearch(newVal)
          dispatch(publicationsAC.get({ labels: newVal }))
        }, 100)
      }
    },
    [labels, prevSearch, setPrevSearch]
  )

  const getNextChunk = useCallback(() => {
    if (publications.length >= PUBLICATION_QUERY_LIMIT) {
      const lastVisible = publications[publications.length - 1]
      dispatch(publicationsAC.get({ labels, lastVisible }))
    }
  }, [publications[publications.length - 1]])

  return (
    <View style={[theme.containers.centerColumn, { backgroundColor: colors.background }]}>
      <InfiniteScroll
        isLoading={isLoading}
        onRefresh={() => dispatch(publicationsAC.get({ labels }))}
        onScrollToBottom={getNextChunk}
      >
        <LabelsInput
          labels={labels}
          setLabels={setLabels}
          onWriteLabel={searchByLabel}
          style={{ paddingHorizontal: 20 }}
        />
        {internet.isOnline ? (
          publications.map(publication => <Publication key={publication.uid} publication={publication} />)
        ) : (
          <TextSecondary>Offline</TextSecondary>
        )}
      </InfiniteScroll>
    </View>
  )
}
