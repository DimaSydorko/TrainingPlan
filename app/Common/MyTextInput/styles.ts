import { StyleSheet } from 'react-native'
import { colors } from '../../Theme/colors'
import { screen } from '../../Utils/constants'

export default StyleSheet.create({
  container: {
    width: '100%'
  },
  ordinary: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    color: colors.text,
    backgroundColor: colors.white,
    marginVertical: 10,
    paddingHorizontal: 12,
    width: screen.vw - 40
  },
  underline: {
    width: '100%',
    marginVertical: 8,
    height: 48,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    color: colors.text,
    borderBottomWidth: 1,
    fontSize: 18,
    borderRadius: 0
  },
  secondary: {
    width: '100%',
    marginVertical: 8,
    height: 36,
    paddingHorizontal: 4,
    borderBottomColor: colors.textSecondary,
    color: colors.textSecondary,
    borderBottomWidth: 1,
    fontSize: 14,
    borderRadius: 0
  }
})
