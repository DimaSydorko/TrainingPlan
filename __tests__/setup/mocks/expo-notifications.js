/**
 * expo-notifications mock. Scheduling returns incrementing ids; scheduled requests are kept in
 * `__scheduled` (cleared by cancel*). Permissions are granted by default; override per test with
 * `Notifications.getPermissionsAsync.mockResolvedValueOnce({ granted: false, status: 'denied' })`.
 */
let nextId = 1
const scheduled = new Map()
const granted = { granted: true, status: 'granted', canAskAgain: true, expires: 'never' }
const subscription = () => ({ remove: jest.fn() })

module.exports = {
  __esModule: true,
  __scheduled: scheduled,
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => granted),
  requestPermissionsAsync: jest.fn(async () => granted),
  scheduleNotificationAsync: jest.fn(async request => {
    const id = request && request.identifier ? request.identifier : `notification-${nextId++}`
    scheduled.set(id, request)
    return id
  }),
  cancelScheduledNotificationAsync: jest.fn(async id => {
    scheduled.delete(id)
  }),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => {
    scheduled.clear()
  }),
  getAllScheduledNotificationsAsync: jest.fn(async () =>
    Array.from(scheduled.entries()).map(([identifier, request]) => ({ identifier, ...request }))
  ),
  dismissNotificationAsync: jest.fn(async () => {}),
  dismissAllNotificationsAsync: jest.fn(async () => {}),
  presentNotificationAsync: jest.fn(async () => `notification-${nextId++}`),
  setNotificationChannelAsync: jest.fn(async (id, channel) => ({ id, ...channel })),
  deleteNotificationChannelAsync: jest.fn(async () => {}),
  setNotificationCategoryAsync: jest.fn(async () => null),
  setBadgeCountAsync: jest.fn(async () => true),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  useLastNotificationResponse: jest.fn(() => null),
  addNotificationReceivedListener: jest.fn(subscription),
  addNotificationResponseReceivedListener: jest.fn(subscription),
  addNotificationsDroppedListener: jest.fn(subscription),
  removeNotificationSubscription: jest.fn(),
  AndroidImportance: { UNSPECIFIED: -1000, NONE: 0, MIN: 1, LOW: 2, DEFAULT: 3, HIGH: 4, MAX: 5 },
  AndroidNotificationVisibility: { UNKNOWN: 0, PUBLIC: 1, PRIVATE: 2, SECRET: 3 },
  AndroidNotificationPriority: { MIN: 'min', LOW: 'low', DEFAULT: 'default', HIGH: 'high', MAX: 'max' },
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
  },
}
