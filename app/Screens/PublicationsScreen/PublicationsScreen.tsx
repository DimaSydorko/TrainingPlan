import * as React from 'react'
import { View } from 'react-native'
import { usePublications, useSettings } from '../../Hooks/redux'
import Publication from '../../Components/Publication/Publication'
import { TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'

export default function PublicationsScreen() {
  const { colors } = useSettings()
  const { publications } = usePublications()
  const { internet } = useSettings()

  return (
    <View style={[theme.containers.centerColumn, { backgroundColor: colors.background }]}>
      {internet.isOnline ? (
        publications.map(publication => <Publication key={publication.uid} publication={publication} />)
      ) : (
        <TextSecondary>Offline</TextSecondary>
      )}
    </View>
  )
}
