/**
 * app/lib/supabase/client mock. No network: auth starts signed out (INITIAL_SESSION with null) and every
 * call resolves to `{ data: null, error: null }`. Override per test, e.g.
 * `supabase.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error })`.
 */
const ok = (data = null) => jest.fn(async () => ({ data, error: null }))

const createQuery = () => {
  const query = {}
  ;['select', 'eq', 'in', 'order', 'range', 'limit', 'insert', 'update', 'upsert', 'delete'].forEach(method => {
    query[method] = jest.fn(() => query)
  })
  query.single = ok()
  query.maybeSingle = ok()
  query.then = (onFulfilled, onRejected) => Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected)
  return query
}

const supabase = {
  auth: {
    onAuthStateChange: jest.fn(callback => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', null))
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    }),
    getSession: ok({ session: null }),
    signInWithPassword: ok({ session: null, user: null }),
    signUp: ok({ session: null, user: null }),
    signInWithIdToken: ok({ session: null, user: null }),
    signOut: jest.fn(async () => ({ error: null })),
    startAutoRefresh: jest.fn(),
    stopAutoRefresh: jest.fn(),
  },
  from: jest.fn(() => createQuery()),
  rpc: ok(),
}

module.exports = { __esModule: true, supabase }
