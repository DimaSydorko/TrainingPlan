/** expo-localization mock. The device reports English (en-US); override `getLocales` in a test to simulate another language. */
const EN_US_LOCALE = {
  languageTag: 'en-US',
  languageCode: 'en',
  regionCode: 'US',
  languageRegionCode: 'US',
  textDirection: 'ltr',
  decimalSeparator: '.',
  digitGroupingSeparator: ',',
  measurementSystem: 'metric',
  currencyCode: 'USD',
  currencySymbol: '$',
  languageCurrencyCode: 'USD',
  languageCurrencySymbol: '$',
  temperatureUnit: 'celsius',
}

const DEFAULT_CALENDAR = {
  calendar: 'gregory',
  timeZone: 'UTC',
  uses24hourClock: true,
  firstWeekday: 2,
}

module.exports = {
  __esModule: true,
  getLocales: jest.fn(() => [EN_US_LOCALE]),
  getCalendars: jest.fn(() => [DEFAULT_CALENDAR]),
  useLocales: jest.fn(() => [EN_US_LOCALE]),
  useCalendars: jest.fn(() => [DEFAULT_CALENDAR]),
}
