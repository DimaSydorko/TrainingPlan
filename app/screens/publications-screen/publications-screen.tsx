import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, usePublications } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { publicationsAC } from '@store/publications-reducer/publications-ac'
import { InfiniteScroll, LabelsInput } from '@common'
import Publication from '@components/publication/publication'
import { deepCompare } from '@utils'
import { PUBLICATION_QUERY_LIMIT } from '@utils/constants'
import NoSignalIcon from '@assets/icons/no-signal-icon'
import EmptySearchIcon from '@assets/icons/empty-search-icon'
import Stack from '@common/stack/stack'
import styles from './publications-screen.styles'

export default function PublicationsScreen() {
  const dispatch = useAppDispatch()
  const { colors } = useAppTheme()
  const { publications, isLoading } = usePublications()
  const isOnline = useIsOnline()
  const [labels, setLabels] = useState<string[]>([])
  const [prevSearch, setPrevSearch] = useState<string[]>([])
  const screenStyle = useMemo(() => ({ backgroundColor: colors.background }), [colors.background])

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
    <Stack preset='centerColumn' style={screenStyle}>
      {isOnline ? (
        <InfiniteScroll
          isLoading={isLoading}
          onRefresh={() => dispatch(publicationsAC.get({ labels }))}
          onScrollToBottom={getNextChunk}
        >
          <LabelsInput labels={labels} setLabels={setLabels} onWriteLabel={searchByLabel} style={styles.labelsInput} />
          {publications.length ? (
            publications.map(publication => <Publication key={publication.uid} publication={publication} />)
          ) : (
            <EmptySearchIcon />
          )}
        </InfiniteScroll>
      ) : (
        <NoSignalIcon />
      )}
    </Stack>
  )
}
