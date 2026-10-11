module.exports = function (api) {
  api.cache(true)
  return {
    // babel-preset-expo adds the react-native-worklets plugin automatically when it is installed
    presets: ['babel-preset-expo'],
  }
}
