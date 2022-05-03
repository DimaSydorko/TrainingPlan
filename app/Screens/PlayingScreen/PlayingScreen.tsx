import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { stopPlaying } from '../../store/PlayingReduser/PlayingSlice'
import { useAppDispatch } from '../../Hooks/redux'
import { IconButton } from '../../Common'
import { FlexCenterColumn, FlexSpaceBetween } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'
import styles from './styles'

export default memo(function PlayingScreen() {
  const dispatch = useAppDispatch()
  const [isPlaying, setIsPlaying] = useState(true)
  const onBack = useCallback(() => {
    dispatch(stopPlaying())
  }, [])

  return (
    <SafeAreaView style={[theme.containers.centerColumn, styles.page]}>
      <View style={[theme.containers.headerStyle, styles.header]}>
        <FlexSpaceBetween>
          <Text>1</Text>
          <Text>2</Text>
          <Text>3</Text>
        </FlexSpaceBetween>
      </View>
      <FlexCenterColumn>
        <TouchableOpacity style={{ borderRadius: 100 }} onPress={() => setIsPlaying(p => !p)}>
          <CountdownCircleTimer
            isPlaying={isPlaying}
            duration={30}
            colors={[colors.primary, colors.primary, colors.secondPrimary] as any}
            colorsTime={[7, 5, 0]}
          >
            {({ remainingTime }) => <Text>{remainingTime}</Text>}
          </CountdownCircleTimer>
        </TouchableOpacity>
      </FlexCenterColumn>
      <FlexSpaceBetween style={styles.footer}>
        <IconButton onPress={onBack} iconName={icon.back} color={colors.textSecondary} size={35} />
        <FlexSpaceBetween style={{ width: '50%' }}>
          <IconButton onPress={() => {}} iconName={icon.skipPrevious} color={colors.black} size={35} />
          <IconButton onPress={() => {}} iconName={icon.play} color={colors.primary} size={45} />
          <IconButton onPress={() => {}} iconName={icon.skipNext} color={colors.black} size={35} />
        </FlexSpaceBetween>
        <IconButton onPress={() => {}} iconName={icon.playlist} color={colors.black} size={35} />
      </FlexSpaceBetween>
    </SafeAreaView>
  )
})
