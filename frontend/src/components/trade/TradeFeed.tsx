'use client'

import { useMemo } from 'react'
import { useMarketTrades } from '@/hooks/useCoins'
import { formatPrice, formatQuantity } from '@/lib/utils'
import styles from './TradeFeed.module.css'

interface TradeFeedProps {
  market: string
}

function formatTime(utcDate: string, utcTime: string): string {
  if (!utcDate || !utcTime) return '-'
  const iso = `${utcDate}T${utcTime}Z`
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function TradeFeed({ market }: TradeFeedProps) {
  const { data: trades, isLoading } = useMarketTrades(market, 60)

  const strength = useMemo(() => {
    if (!trades || trades.length === 0) return null
    let bidVol = 0
    let askVol = 0
    for (const t of trades) {
      if (t.askBid === 'BID') bidVol += Number(t.tradeVolume) || 0
      else askVol += Number(t.tradeVolume) || 0
    }
    if (askVol <= 0) return null
    return (bidVol / askVol) * 100
  }, [trades])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>체결 로딩중...</div>
      </div>
    )
  }

  if (!trades || trades.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>체결 내역이 없습니다.</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {strength !== null && (
        <div className={styles.strengthBar}>
          <span className={styles.strengthLabel}>체결강도</span>
          <span
            className={`${styles.strengthValue} ${strength >= 100 ? styles.strengthBuy : styles.strengthSell}`}
          >
            {strength.toFixed(2)}%
          </span>
        </div>
      )}
      <div className={styles.header}>
        <span className={styles.colTime}>시간</span>
        <span className={styles.colPrice}>체결가</span>
        <span className={styles.colSize}>체결량</span>
      </div>
      <ul className={styles.list}>
        {trades.map((t) => {
          const isBid = t.askBid === 'BID'
          const colorClass = isBid ? styles.rowBid : styles.rowAsk
          return (
            <li key={t.sequentialId} className={`${styles.row} ${colorClass}`}>
              <span className={styles.colTime}>{formatTime(t.tradeDateUtc, t.tradeTimeUtc)}</span>
              <span className={`${styles.colPrice} ${isBid ? styles.priceRise : styles.priceFall}`}>
                {formatPrice(Number(t.tradePrice))}
              </span>
              <span className={styles.colSize}>{formatQuantity(Number(t.tradeVolume))}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
