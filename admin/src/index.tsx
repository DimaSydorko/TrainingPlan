import React from 'react'
import {CssBaseline} from "@mui/material";
import ReactDOM from 'react-dom/client'
import './App.module.scss'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <CssBaseline/>
    <App />
  </React.StrictMode>
)
