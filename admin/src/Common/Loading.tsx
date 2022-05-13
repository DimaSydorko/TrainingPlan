import React from 'react'
import { CircularProgress } from '@mui/material'

const Loading = () => (
  <div
    style={{
      zIndex: 1000,
      position: 'absolute',
      display: 'flex',
      top: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'rgba(0,0,0,0.68)'
    }}
  >
    <CircularProgress color='primary' />
  </div>
)

export default Loading
