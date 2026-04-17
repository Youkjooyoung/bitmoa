'use client'

import { useEffect, useRef } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useTickerStore } from '@/stores/tickerStore'
import type { Ticker } from '@/types'

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8082/ws'

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })

    const handleMessage = (message: IMessage) => {
      try {
        const data = JSON.parse(message.body)
        const tickers: Ticker[] = Array.isArray(data) ? data : [data]
        if (tickers.length === 0) return
        useTickerStore.getState().updateTickers(tickers)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('시세 메시지 파싱 실패', err, message.body)
        }
      }
    }

    client.onConnect = () => {
      client.subscribe('/topic/ticker/all', handleMessage)
    }

    client.onStompError = (frame) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('STOMP 오류', frame.headers['message'], frame.body)
      }
    }

    client.activate()
    clientRef.current = client

    return () => {
      clientRef.current?.deactivate()
      clientRef.current = null
    }
  }, [])

  return clientRef.current
}
