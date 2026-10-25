import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginTop: 10,
  },
  plan: {
    margin: spacing.xxs,
    padding: 6,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedIcon: {
    position: 'absolute',
    opacity: 0.8,
    zIndex: 0,
  },
  textHeader: {
    zIndex: 1,
  },
})
