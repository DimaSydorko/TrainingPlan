import * as React from 'react'
import { useCallback, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useAppDispatch, usePublications, useSettings } from '../../Hooks/redux'
import { publicationsAC } from '../../store/PublicationsReducer/PublicationsAC'
import { LabelsInput } from '../../Common'
import Publication from '../../Components/Publication/Publication'
import { TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import { deepCompare } from '../../Utils'

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
    [labels, prevSearch]
  )

  return (
    <View style={[theme.containers.centerColumn, { backgroundColor: colors.background }]}>
      <LabelsInput
        labels={labels}
        setLabels={setLabels}
        onWriteLabel={searchByLabel}
        style={{ paddingHorizontal: 20 }}
      />
      {isLoading ? (
        <ActivityIndicator size='large' color={colors.secondPrimary} />
      ) : internet.isOnline ? (
        publications.map(publication => <Publication key={publication.uid} publication={publication} />)
      ) : (
        <TextSecondary>Offline</TextSecondary>
      )}
    </View>
  )
}
