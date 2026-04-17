'use client'

import { useState } from 'react'
import OrderBook from './OrderBook'
import TradeFeed from './TradeFeed'
import styles from './OrderBookPanel.module.css'

interface OrderBookPanelProps {
  market: string
}

type TabKey = 'orderbook' | 'trades'

export default function OrderBookPanel({ market }: OrderBookPanelProps) {
  const [tab, setTab] = useState<TabKey>('orderbook')

  return (
    <div className={styles.panel}>
      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabButton} ${tab === 'orderbook' ? styles.tabActive : ''}`}
          onClick={() => setTab('orderbook')}
        >
          호가
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${tab === 'trades' ? styles.tabActive : ''}`}
          onClick={() => setTab('trades')}
        >
          체결
        </button>
      </div>
      <div className={styles.body}>
        {tab === 'orderbook' ? <OrderBook market={market} /> : <TradeFeed market={market} />}
      </div>
    </div>
  )
}
