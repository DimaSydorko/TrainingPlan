import React from 'react'
import 'react-native-gesture-handler';
import {Provider} from "react-redux";
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

function App() {
  return (
    <Provider store={store}>
      <AuthRouter/>
    </Provider>
  );
}

registerRootComponent(App);