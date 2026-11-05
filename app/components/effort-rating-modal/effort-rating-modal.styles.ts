import { StyleSheet } from 'react-native'
import { radius, spacing } from '@theme/tokens'

export default StyleSheet.create({
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.md,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xxs,
    borderRadius: radius.base,
    borderWidth: 1,
  },
})
