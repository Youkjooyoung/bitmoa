'use client'

import { useCoins } from '@/hooks/useCoins'
import { useTickerStore } from '@/stores/tickerStore'
import { formatPrice, formatPercent, formatNumber } from '@/lib/utils'
import styles from './CoinHeader.module.css'

interface CoinHeaderProps {
  market: string
}

export default function CoinHeader({ market }: CoinHeaderProps) {
  const { data: coins } = useCoins()
  const { tickers } = useTickerStore()

  const coin = coins?.find((c) => c.market === market)
  const ticker = tickers[market]

  const getPriceClass = (change?: string) => {
    switch (change) {
      case 'RISE':
        return styles.priceRise
      case 'FALL':
        return styles.priceFall
      default:
        return styles.priceEven
    }
  }

  const priceClass = getPriceClass(ticker?.change)

  return (
    <div className={styles.header}>
      <div className={styles.coinInfo}>
        <span className={styles.coinName}>{coin?.koreanName || market}</span>
        <span className={styles.coinMarket}>{market}</span>
      </div>

      {ticker && (
        <>
          <div className={styles.priceSection}>
            <span className={`${styles.price} ${priceClass}`}>{formatPrice(ticker.tradePrice)}</span>
            <span className={`${styles.change} ${priceClass}`}>
              {formatPercent(ticker.changeRate)} ({formatPrice(ticker.changePrice)})
            </span>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>고가</span>
              <span className={`${styles.statValue} ${styles.priceRise}`}>{formatPrice(ticker.highPrice)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>저가</span>
              <span className={`${styles.statValue} ${styles.priceFall}`}>{formatPrice(ticker.lowPrice)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>거래대금 (24H)</span>
              <span className={styles.statValue}>{formatNumber(ticker.accTradePrice24h / 1000000, 0)}백만</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
