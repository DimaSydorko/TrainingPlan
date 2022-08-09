import * as React from 'react'
import { memo } from 'react'
import { Image, StyleSheet } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { getUserInitials } from '../../Utils'
import { FlexCenter, TextHeader } from '../../Theme/Parents'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'

function stringToInt(str: string) {
  let res = 0
  for (let i = 0; i < str.length; i++) {
    res += str.charCodeAt(i)
  }
  return res
}

function getColorFromName(name: string, isDark: boolean) {
  return COLORS_EXERCISE[stringToInt(name) % COLORS_EXERCISE.length][+isDark]
}

interface IProps {
  name: string
  photoUrl: string | undefined
}

export default memo(function UserImage({ name = '', photoUrl }: IProps) {
  const { colors } = useSettings()
  const isDarkTheme = colors.primary === colorsDark.primary

  return photoUrl ? (
    <Image source={{ uri: photoUrl }} style={[styles.profileImage, { borderColor: colors.black }]} />
  ) : (
    <FlexCenter style={[styles.profileImage, { backgroundColor: getColorFromName(name, isDarkTheme), opacity: 0.5 }]}>
      <TextHeader style={{ fontSize: 32 }}>{getUserInitials(name)}</TextHeader>
    </FlexCenter>
  )
})

const imageSize = 96

const styles = StyleSheet.create({
  profileImage: {
    height: imageSize,
    width: imageSize,
    borderRadius: imageSize / 2,
    borderStyle: 'solid',
    borderWidth: 1,
    marginVertical: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
