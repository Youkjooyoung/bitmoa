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

    const handleDelta = (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body)
        const tickers: Ticker[] = Array.isArray(payload?.tickers)
          ? payload.tickers
          : Array.isArray(payload)
            ? payload
            : [payload]
        if (!tickers || tickers.length === 0) return
        useTickerStore.getState().applyDelta(tickers)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('시세 델타 파싱 실패', err, message.body)
        }
      }
    }

    client.onConnect = () => {
      client.subscribe('/topic/ticker/delta', handleDelta)
    }

    client.onStompError = (frame) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('STOMP 오류', frame.headers['message'], frame.body)
      }
    }

    clientRef.current = client

    const scheduleActivate = (cb: () => void) => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback
      if (typeof ric === 'function') {
        ric(cb, { timeout: 1500 })
      } else {
        setTimeout(cb, 300)
      }
    }

    let activated = false
    scheduleActivate(() => {
      if (clientRef.current === client) {
        client.activate()
        activated = true
      }
    })

    return () => {
      if (activated) {
        clientRef.current?.deactivate()
      }
      clientRef.current = null
    }
  }, [])

  return clientRef.current
}
