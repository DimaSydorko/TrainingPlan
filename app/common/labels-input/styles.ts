import { StyleSheet } from 'react-native'
import { radius, spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    width: '100%',
  },
  labels: {
    marginTop: 5,
    flexWrap: 'wrap',
  },
  labelText: {
    borderRadius: radius.xs,
    padding: 3,
    width: 'auto',
    marginRight: spacing.xxs,
    marginTop: 3,
  },
})
