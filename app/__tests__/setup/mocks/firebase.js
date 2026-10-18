/**
 * Firebase mock that works for both the compat (v8 namespaced) API and
 * the modular API. Every property access and every call
 * returns another chainable stub, so module-level code such as
 *   firebase.initializeApp(cfg); firebase.firestore().collection('x')
 *   initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
 * runs without network or credentials.
 *
 * The result of a call is thenable and resolves to a (non-thenable) stub, so both
 * `await getDocs(q)` and compat `ref.get().then(snap => ...)` work. Subscriptions
 * (onAuthStateChanged, onSnapshot, ...) return a stub, which is callable as an unsubscribe function.
 * Callbacks passed in are never invoked and iterating a stub yields nothing.
 *
 * Tests that need real behaviour should mock at a higher level in the test file, e.g.
 * `jest.mock('@utils/firebase')` or spy on the thunk under test.
 */
function createStub(path, thenable = false) {
  const children = new Map()
  const label = `[firebase mock ${path}]`
  const target = function firebaseStub() {}
  return new Proxy(target, {
    get(_target, prop) {
      if (typeof prop === 'symbol') {
        if (prop === Symbol.toPrimitive) return () => label
        if (prop === Symbol.iterator) return function* () {}
        return undefined
      }
      // Not a promise, not a React element, not a jest asymmetric matcher, not a DOM node.
      if (prop === 'then') {
        if (!thenable) return undefined
        return (onFulfilled, onRejected) =>
          Promise.resolve(createStub(`${path}.resolved`)).then(onFulfilled, onRejected)
      }
      if (prop === 'catch' && thenable) return () => Promise.resolve(createStub(`${path}.resolved`))
      if (prop === 'finally' && thenable) {
        return onFinally => Promise.resolve(createStub(`${path}.resolved`)).finally(onFinally)
      }
      if (prop === '$$typeof' || prop === 'asymmetricMatch' || prop === 'nodeType') return undefined
      if (prop === '__esModule') return true
      if (prop === 'toJSON' || prop === 'toString' || prop === 'valueOf') return () => label
      // compat: `if (!firebase.apps.length) firebase.initializeApp(...)`
      if (prop === 'length') return 0
      if (prop === 'prototype') return _target.prototype
      if (!children.has(prop)) children.set(prop, createStub(`${path}.${prop}`))
      return children.get(prop)
    },
    apply() {
      return createStub(`${path}()`, true)
    },
    construct() {
      return createStub(`new ${path}`)
    },
  })
}

module.exports = { createStub }
