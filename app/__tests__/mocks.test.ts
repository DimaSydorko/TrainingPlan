import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'

/**
 * Guards the shared mocks in app/__tests__/setup so other agents can rely on them. If one of these
 * fails after a package upgrade, update the mock in app/__tests__/setup/mocks/ rather than the test.
 */
describe('shared native mocks', () => {
  it('mocks expo-audio players with jest functions', () => {
    const audio = require('expo-audio')
    const player = audio.createAudioPlayer(1)
    player.play()
    expect(player.play).toHaveBeenCalledTimes(1)
    expect(player.playing).toBe(true)
    expect(audio.__players).toContain(player)
  })

  it('mocks expo-speech, expo-keep-awake and expo-notifications', async () => {
    const Speech = require('expo-speech')
    const onDone = jest.fn()
    Speech.speak('hello', { onDone })
    expect(onDone).toHaveBeenCalled()

    const KeepAwake = require('expo-keep-awake')
    await KeepAwake.activateKeepAwakeAsync('workout')
    expect(KeepAwake.activateKeepAwakeAsync).toHaveBeenCalledWith('workout')

    const Notifications = require('expo-notifications')
    const id = await Notifications.scheduleNotificationAsync({ content: { title: 't' }, trigger: null })
    expect(Notifications.__scheduled.has(id)).toBe(true)
    await Notifications.cancelScheduledNotificationAsync(id)
    expect(Notifications.__scheduled.has(id)).toBe(false)
  })

  it('mocks Google Sign-In with a successful sign-in by default', async () => {
    const { GoogleSignin, isSuccessResponse } = require('@react-native-google-signin/google-signin')
    const response = await GoogleSignin.signIn()
    expect(isSuccessResponse(response)).toBe(true)
    expect(response.data.idToken).toBe('mock-google-id-token')
  })

  it('uses the official AsyncStorage and NetInfo mocks', async () => {
    await AsyncStorage.setItem('k', 'v')
    await expect(AsyncStorage.getItem('k')).resolves.toBe('v')
    expect(jest.isMockFunction(NetInfo.addEventListener)).toBe(true)
  })
})
