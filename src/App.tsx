import React from 'react'
import 'react-native-gesture-handler';
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import {persistStore} from 'redux-persist';
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import {decode, encode} from 'base-64'
import {setupStore} from "./store";
import AuthRouter from "./Routers/AuthRouter";

if (!global.btoa) {
  global.btoa = encode
}
if (!global.atob) {
  global.atob = decode
}
const store = setupStore();
let persistedStore = persistStore(store);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <AuthRouter/>
      </PersistGate>
    </Provider>
  );
}

registerRootComponent(App);