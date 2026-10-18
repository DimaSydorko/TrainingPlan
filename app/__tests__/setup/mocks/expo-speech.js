/** expo-speech mock. `speak` immediately calls `onStart` and `onDone` if given. */
module.exports = {
  __esModule: true,
  speak: jest.fn((_text, options = {}) => {
    options.onStart && options.onStart()
    options.onDone && options.onDone()
  }),
  stop: jest.fn(async () => {}),
  pause: jest.fn(async () => {}),
  resume: jest.fn(async () => {}),
  isSpeakingAsync: jest.fn(async () => false),
  getAvailableVoicesAsync: jest.fn(async () => []),
  maxSpeechInputLength: 4000,
  VoiceQuality: { Default: 'Default', Enhanced: 'Enhanced' },
}
