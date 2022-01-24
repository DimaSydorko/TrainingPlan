import React from 'react'
import 'react-native-gesture-handler';
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import {decode, encode} from 'base-64'
import AuthRouter from "./Routers/AuthRouter/AuthRouter";
import {AuthProvider} from "./Providers";

if (!global.btoa) {
  global.btoa = encode
}
if (!global.atob) {
  global.atob = decode
}

function App() {
  return (
    <AuthProvider>
      <AuthRouter/>
    </AuthProvider>
  );
}

registerRootComponent(App);