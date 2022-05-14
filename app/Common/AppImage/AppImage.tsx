import * as React from 'react'
import { Image, StyleSheet, View, ViewProps, ViewStyle } from 'react-native'

const styles = StyleSheet.create({
  imageC: {
    borderRadius: 100,
    overflow: 'hidden',
    margin: 3
  }
})

interface IAppImage {
  size: number
  src: string
  style?: ViewStyle
}

export default function AppImage({ src, size, style, ...props }: IAppImage & ViewProps) {
  const imgSize = { height: size, width: size }
  return (
    <View style={[styles.imageC, imgSize, style]} {...props}>
      <Image source={{ uri: src }} style={imgSize} />
    </View>
  )
}
