'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useOrderbook } from '@/hooks/useCoins'
import { useTickerStore } from '@/stores/tickerStore'
import { useOrderFormStore } from '@/stores/orderFormStore'
import { formatPrice, formatQuantity } from '@/lib/utils'
import styles from './OrderBook.module.css'

interface OrderBookProps {
  market: string
}

export default function OrderBook({ market }: OrderBookProps) {
  const { data: orderbook, isLoading } = useOrderbook(market)
  const ticker = useTickerStore((state) => state.tickers[market])
  const prevClosingPrice = ticker?.prevClosingPrice
  const setPresetPrice = useOrderFormStore((state) => state.setPresetPrice)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentPriceRef = useRef<HTMLDivElement>(null)
  const centeredRef = useRef(false)

  useEffect(() => {
    centeredRef.current = false
  }, [market])

  useEffect(() => {
    if (!orderbook || centeredRef.current) return
    const area = scrollAreaRef.current
    const current = currentPriceRef.current
    if (!area || !current) return
    const center = () => {
      const a = scrollAreaRef.current
      const c = currentPriceRef.current
      if (!a || !c) return
      const areaRect = a.getBoundingClientRect()
      const currentRect = c.getBoundingClientRect()
      const offset = currentRect.top - areaRect.top + a.scrollTop
      const target = offset - a.clientHeight / 2 + c.clientHeight / 2
      a.scrollTop = Math.max(0, target)
      centeredRef.current = true
    }
    const t1 = setTimeout(center, 50)
    const t2 = setTimeout(center, 200)
    const t3 = setTimeout(center, 500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [orderbook])

  const { asks, bids, maxSize } = useMemo(() => {
    const rawAsks = orderbook?.asks ?? []
    const rawBids = orderbook?.bids ?? []
    const max = Math.max(
      0,
      ...rawAsks.map((u) => Number(u.size) || 0),
      ...rawBids.map((u) => Number(u.size) || 0)
    )
    return {
      asks: [...rawAsks].reverse(),
      bids: rawBids,
      maxSize: max,
    }
  }, [orderbook])

  const handlePriceClick = (price: number) => setPresetPrice(price)

  const getChangePercent = (price: number) => {
    if (!prevClosingPrice) return null
    return ((price - prevClosingPrice) / prevClosingPrice) * 100
  }

  const getPriceColor = (price: number) => {
    const pct = getChangePercent(price)
    if (pct === null) return styles.priceEven
    if (pct > 0) return styles.priceRise
    if (pct < 0) return styles.priceFall
    return styles.priceEven
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>호가 로딩중...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>가격</span>
        <span>수량</span>
      </div>
      <div ref={scrollAreaRef} className={styles.scrollArea}>
        {asks.map((ask, index) => {
          const size = Number(ask.size) || 0
          const ratio = maxSize > 0 ? (size / maxSize) * 100 : 0
          const changePct = getChangePercent(Number(ask.price))
          return (
            <div
              key={`ask-${index}`}
              className={`${styles.row} ${styles.rowAsk}`}
              onClick={() => handlePriceClick(Number(ask.price))}
              role="button"
              tabIndex={0}
            >
              <span
                className={styles.bar}
                style={{ width: `${ratio}%`, backgroundColor: `rgba(18, 97, 196, ${0.15 + (ratio / 100) * 0.4})` }}
              />
              <span className={styles.cellPrice}>
                <span className={getPriceColor(Number(ask.price))}>{formatPrice(Number(ask.price))}</span>
                {changePct !== null && (
                  <span className={`${styles.changePct} ${getPriceColor(Number(ask.price))}`}>
                    {changePct > 0 ? '+' : ''}
                    {changePct.toFixed(2)}%
                  </span>
                )}
              </span>
              <span className={styles.cellSize}>{formatQuantity(size)}</span>
            </div>
          )
        })}

        <div
          ref={currentPriceRef}
          className={styles.currentPrice}
          onClick={() => ticker && handlePriceClick(ticker.tradePrice)}
          role="button"
          tabIndex={0}
        >
          {ticker ? formatPrice(ticker.tradePrice) : '-'}
        </div>

        {bids.map((bid, index) => {
          const size = Number(bid.size) || 0
          const ratio = maxSize > 0 ? (size / maxSize) * 100 : 0
          const changePct = getChangePercent(Number(bid.price))
          return (
            <div
              key={`bid-${index}`}
              className={`${styles.row} ${styles.rowBid}`}
              onClick={() => handlePriceClick(Number(bid.price))}
              role="button"
              tabIndex={0}
            >
              <span
                className={styles.bar}
                style={{ width: `${ratio}%`, backgroundColor: `rgba(200, 74, 49, ${0.15 + (ratio / 100) * 0.4})` }}
              />
              <span className={styles.cellPrice}>
                <span className={getPriceColor(Number(bid.price))}>{formatPrice(Number(bid.price))}</span>
                {changePct !== null && (
                  <span className={`${styles.changePct} ${getPriceColor(Number(bid.price))}`}>
                    {changePct > 0 ? '+' : ''}
                    {changePct.toFixed(2)}%
                  </span>
                )}
              </span>
              <span className={styles.cellSize}>{formatQuantity(size)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
