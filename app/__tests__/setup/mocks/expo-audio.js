/**
 * expo-audio mock. createAudioPlayer() returns a fresh player whose methods are jest.fn(), and every
 * created player is kept in `__players` so tests can assert on them:
 *
 *   const { createAudioPlayer, __players } = require('expo-audio')
 *   expect(__players[0].play).toHaveBeenCalled()
 */
const players = []

function createMockPlayer(source, options) {
  const player = {
    source,
    options,
    id: `player-${players.length}`,
    playing: false,
    paused: true,
    isLoaded: true,
    isBuffering: false,
    loop: false,
    muted: false,
    volume: 1,
    playbackRate: 1,
    currentTime: 0,
    duration: 1,
    play: jest.fn(() => {
      player.playing = true
      player.paused = false
    }),
    pause: jest.fn(() => {
      player.playing = false
      player.paused = true
    }),
    seekTo: jest.fn(async seconds => {
      player.currentTime = seconds
    }),
    replace: jest.fn(next => {
      player.source = next
    }),
    setPlaybackRate: jest.fn(),
    remove: jest.fn(),
    release: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
  }
  players.push(player)
  return player
}

module.exports = {
  __esModule: true,
  __players: players,
  createAudioPlayer: jest.fn((source, options) => createMockPlayer(source, options)),
  useAudioPlayer: jest.fn((source, options) => createMockPlayer(source, options)),
  useAudioPlayerStatus: jest.fn(() => ({
    playing: false,
    isLoaded: true,
    currentTime: 0,
    duration: 1,
    didJustFinish: false,
  })),
  setAudioModeAsync: jest.fn(async () => {}),
  setIsAudioActiveAsync: jest.fn(async () => {}),
  requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  getRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  AudioModule: {},
}
