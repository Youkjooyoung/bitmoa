'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useMarketStore } from '@/stores/marketStore'
import CoinHeader from '@/components/trade/CoinHeader'
import PriceChart from '@/components/trade/PriceChart'
import OrderBookPanel from '@/components/trade/OrderBookPanel'
import OrderForm from '@/components/trade/OrderForm'
import MyOrders from '@/components/trade/MyOrders'
import styles from './page.module.css'

export default function TradePage() {
  const params = useParams()
  const market = params.market as string
  const { setSelectedMarket } = useMarketStore()

  useEffect(() => {
    setSelectedMarket(market)
  }, [market, setSelectedMarket])

  return (
    <div className={styles.container}>
      <CoinHeader market={market} />
      <div className={styles.content}>
        <div className={styles.chartColumn}>
          <PriceChart market={market} />
        </div>
        <div className={styles.orderbookColumn}>
          <OrderBookPanel market={market} />
        </div>
        <div className={styles.orderFormColumn}>
          <OrderForm market={market} />
        </div>
      </div>
      <div className={styles.ordersPanel}>
        <MyOrders market={market} />
      </div>
    </div>
  )
}
