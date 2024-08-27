"use client"

import { useSocket } from '@/providers/socket-provider'
import React, { useEffect } from 'react'

const Home = () => {
  const { isConnected } = useSocket();

  if (isConnected) {
    return (
      <div>Connected</div>
    )
  }

  return (
    <div>Not connected</div>
  )
}

export default Home