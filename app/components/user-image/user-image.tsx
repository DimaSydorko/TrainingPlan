import * as React from 'react'
import { memo } from 'react'
import { Image, StyleSheet } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import { getUserInitials } from '@utils'
import AppText from '@common/app-text/app-text'
import Stack from '@common/stack/stack'
import { getExerciseColor, EXERCISE_COLOR_COUNT } from '@theme/tokens'

function stringToInt(str: string) {
  let res = 0
  for (let i = 0; i < str.length; i++) {
    res += str.charCodeAt(i)
  }
  return res
}

function getColorFromName(name: string, isDark: boolean) {
  return getExerciseColor(stringToInt(name) % EXERCISE_COLOR_COUNT, isDark)
}

interface IProps {
  name: string
  photoUrl: string | undefined
}

export default memo(function UserImage({ name = '', photoUrl }: IProps) {
  const { colors, isDark } = useAppTheme()

  return photoUrl ? (
    <Image source={{ uri: photoUrl }} style={[styles.profileImage, { borderColor: colors.inverse }]} />
  ) : (
    <Stack
      preset='center'
      style={[styles.profileImage, { backgroundColor: getColorFromName(name, isDark), opacity: 0.5 }]}
    >
      <AppText variant='title' style={styles.initials}>
        {getUserInitials(name)}
      </AppText>
    </Stack>
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
  initials: {
    fontSize: 32,
  },
})
