import { StyleSheet } from 'react-native'

const IMAGE_SIZE = 96

export default StyleSheet.create({
  profileImage: {
    height: IMAGE_SIZE,
    width: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    borderStyle: 'solid',
    borderWidth: 1,
    marginVertical: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsBackground: {
    opacity: 0.5,
  },
  initials: {
    fontSize: 32,
  },
})
