/** expo-keep-awake mock. */
module.exports = {
  __esModule: true,
  ExpoKeepAwakeTag: 'ExpoKeepAwakeDefaultTag',
  activateKeepAwake: jest.fn(),
  activateKeepAwakeAsync: jest.fn(async () => {}),
  deactivateKeepAwake: jest.fn(async () => {}),
  useKeepAwake: jest.fn(),
  isAvailableAsync: jest.fn(async () => true),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
}
