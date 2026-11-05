/** expo-crypto mock. `randomUUID` uses Node's crypto, so ids are real v4 UUIDs. */
const { randomUUID } = require('crypto')

module.exports = {
  __esModule: true,
  randomUUID: jest.fn(() => randomUUID()),
}
