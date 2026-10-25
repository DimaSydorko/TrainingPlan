import * as React from 'react'
import { Image, View, ViewProps, ViewStyle } from 'react-native'
import styles from './app-image.styles'

type AppImageProps = {
  size: number
  src: string
  style?: ViewStyle
}

export default function AppImage({ src, size, style, ...props }: AppImageProps & ViewProps) {
  const imgSize = { height: size, width: size }
  return (
    <View style={[styles.imageC, imgSize, style]} {...props}>
      <Image source={{ uri: src }} style={imgSize} />
    </View>
  )
}
