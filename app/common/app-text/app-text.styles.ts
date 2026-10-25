import { StyleSheet } from 'react-native'
import { typography } from '@theme/tokens'

export default StyleSheet.create({
  title: typography.title,
  body: typography.body,
  bodyStrong: typography.bodyStrong,
  caption: typography.caption,
  link: typography.link,
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
})
