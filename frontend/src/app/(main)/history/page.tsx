'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTrades } from '@/hooks/useTrades'
import { useCoins } from '@/hooks/useCoins'
import { formatPrice, formatQuantity, formatNumber } from '@/lib/utils'
import styles from './page.module.css'

export default function HistoryPage() {
  const { isAuthenticated } = useAuthStore()
  const [selectedMarket, setSelectedMarket] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: coins } = useCoins()
  const { data: tradesData } = useTrades(selectedMarket || undefined)

  const tradedMarkets = useMemo(() => {
    if (!tradesData?.content) return [] as string[]
    return Array.from(new Set(tradesData.content.map((t) => t.market)))
  }, [tradesData])

  const coinOptions = useMemo(() => {
    if (!coins) return []
    const filtered = coins.filter((c) => {
      const term = search.toLowerCase().trim()
      if (!term) return true
      return (
        c.market.toLowerCase().includes(term) ||
        c.koreanName.toLowerCase().includes(term) ||
        c.englishName.toLowerCase().includes(term)
      )
    })
    return filtered.slice(0, 50)
  }, [coins, search])

  const selectedLabel = useMemo(() => {
    if (!selectedMarket) return '전체 코인'
    const coin = coins?.find((c) => c.market === selectedMarket)
    return coin ? `${coin.koreanName} (${selectedMarket})` : selectedMarket
  }, [selectedMarket, coins])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const getTypeClass = (type: string) => {
    return type === 'BUY' ? styles.typeBuy : styles.typeSell
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR')
  }

  const handleSelect = (market: string) => {
    setSelectedMarket(market)
    setDropdownOpen(false)
    setSearch('')
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>거래내역</h1>
        <div className={styles.empty}>로그인 후 이용할 수 있습니다.</div>
      </div>
    )
  }

  const trades = tradesData?.content || []

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>거래내역</h1>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup} ref={dropdownRef}>
          <button
            type="button"
            className={styles.filterButton}
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span>{selectedLabel}</span>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <input
                type="text"
                className={styles.dropdownSearch}
                placeholder="코인명/심볼 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <div className={styles.dropdownList}>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${!selectedMarket ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSelect('')}
                >
                  전체 코인
                </button>
                {tradedMarkets.length > 0 && !search && (
                  <>
                    <div className={styles.dropdownSection}>거래한 코인</div>
                    {tradedMarkets.map((m) => {
                      const coin = coins?.find((c) => c.market === m)
                      return (
                        <button
                          key={`traded-${m}`}
                          type="button"
                          className={`${styles.dropdownItem} ${selectedMarket === m ? styles.dropdownItemActive : ''}`}
                          onClick={() => handleSelect(m)}
                        >
                          <span>{coin?.koreanName || m}</span>
                          <span className={styles.dropdownMarket}>{m}</span>
                        </button>
                      )
                    })}
                    <div className={styles.dropdownSection}>전체 코인</div>
                  </>
                )}
                {coinOptions.map((c) => (
                  <button
                    key={c.market}
                    type="button"
                    className={`${styles.dropdownItem} ${selectedMarket === c.market ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSelect(c.market)}
                  >
                    <span>{c.koreanName}</span>
                    <span className={styles.dropdownMarket}>{c.market}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {trades.length === 0 ? (
        <div className={styles.empty}>거래 내역이 없습니다.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>일시</th>
              <th>마켓</th>
              <th>구분</th>
              <th>체결가</th>
              <th>체결수량</th>
              <th>체결금액</th>
              <th>수수료</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td>{formatDate(trade.createdAt)}</td>
                <td>{trade.market}</td>
                <td className={getTypeClass(trade.tradeType)}>{trade.tradeType === 'BUY' ? '매수' : '매도'}</td>
                <td>{formatPrice(trade.price)}</td>
                <td>{formatQuantity(trade.quantity)}</td>
                <td>{formatNumber(trade.totalAmount, 0)}원</td>
                <td>{formatNumber(trade.fee, 0)}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
