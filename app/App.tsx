import * as React from 'react'
import 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { decode, encode } from 'base-64'
import { setupStore } from './store'
import AuthRouter from './Routers/AuthRouter'

if (!global.btoa) global.btoa = encode
if (!global.atob) global.atob = decode

const store = setupStore()
let persistedStore = persistStore(store)

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'seashell' }}>
          <AuthRouter />
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  )
}

export default App
