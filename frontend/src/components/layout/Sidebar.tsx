'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCoins } from '@/hooks/useCoins'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useTickerStore } from '@/stores/tickerStore'
import { useMarketStore } from '@/stores/marketStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { formatPrice, formatPercent } from '@/lib/utils'
import styles from './Sidebar.module.css'

const INITIAL_VISIBLE = 50
const LOAD_STEP = 30
const SCROLL_THRESHOLD = 200

type TabKey = 'KRW' | 'BTC' | 'USDT' | 'holdings' | 'favorites'
type SortKey = 'name' | 'price' | 'change' | 'volume'
type SortDir = 'asc' | 'desc'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'KRW', label: '원화' },
  { key: 'BTC', label: 'BTC' },
  { key: 'USDT', label: 'USDT' },
  { key: 'holdings', label: '보유' },
  { key: 'favorites', label: '관심' },
]

function formatVolumeMillion(value: number | undefined): string {
  if (!value || value < 1) return '-'
  const millions = value / 1_000_000
  if (millions >= 1) return `${Math.floor(millions).toLocaleString('ko-KR')}`
  return value.toLocaleString('ko-KR')
}

interface CoinRowProps {
  market: string
  koreanName: string
  englishName: string
  isActive: boolean
  isFavorite: boolean
  onClick: (market: string) => void
  onToggleFavorite: (market: string) => void
}

const CoinRow = memo(function CoinRow({
  market,
  koreanName,
  englishName,
  isActive,
  isFavorite,
  onClick,
  onToggleFavorite,
}: CoinRowProps) {
  const ticker = useTickerStore((state) => state.tickers[market])
  const prevPriceRef = useRef<number | null>(null)
  const [flashDir, setFlashDir] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (!ticker) return
    const prev = prevPriceRef.current
    const next = ticker.tradePrice
    if (prev !== null && next !== prev) {
      setFlashDir(next > prev ? 'up' : 'down')
      const timeout = setTimeout(() => setFlashDir(null), 450)
      prevPriceRef.current = next
      return () => clearTimeout(timeout)
    }
    prevPriceRef.current = next
  }, [ticker?.tradePrice])

  const changeClass = ticker
    ? ticker.changeRate > 0
      ? styles.priceRise
      : ticker.changeRate < 0
        ? styles.priceFall
        : styles.priceEven
    : styles.priceEven

  const handleClick = useCallback(() => onClick(market), [market, onClick])
  const handleStarClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleFavorite(market)
    },
    [market, onToggleFavorite]
  )

  const [base, quote] = market.split('-')
  const symbolDisplay = `${quote}/${base}`

  const flashClass =
    flashDir === 'up' ? styles.flashUp : flashDir === 'down' ? styles.flashDown : ''

  return (
    <li
      className={`${styles.coinItem} ${isActive ? styles.coinItemActive : ''} ${flashClass}`}
      onClick={handleClick}
    >
      <button
        type="button"
        className={`${styles.starBtn} ${isFavorite ? styles.starActive : ''}`}
        onClick={handleStarClick}
        aria-label="관심 코인"
      >
        ★
      </button>
      <div className={styles.coinInfo}>
        <span className={styles.coinName} title={`${koreanName} · ${englishName}`}>
          {koreanName}
        </span>
        <span className={styles.coinMarket}>{symbolDisplay}</span>
      </div>
      <span className={`${styles.priceValue} ${changeClass}`}>
        {ticker ? formatPrice(ticker.tradePrice) : '-'}
      </span>
      <span className={`${styles.changeRate} ${changeClass}`}>
        {ticker ? formatPercent(ticker.changeRate) : '-'}
      </span>
      <span className={styles.coinVolume}>
        {ticker ? formatVolumeMillion(ticker.accTradePrice24h) : '-'}
        <span className={styles.volumeUnit}>백만</span>
      </span>
    </li>
  )
})

interface SortHeaderProps {
  sortKey: SortKey
  sortDir: SortDir
  onChange: (key: SortKey) => void
}

function SortHeader({ sortKey, sortDir, onChange }: SortHeaderProps) {
  const renderArrow = (key: SortKey) => {
    if (sortKey !== key) return <span className={styles.sortArrowInactive}>▲▼</span>
    return <span className={styles.sortArrow}>{sortDir === 'asc' ? '▲' : '▼'}</span>
  }
  return (
    <div className={styles.sortHeader}>
      <span className={styles.sortStarSpacer} />
      <button
        type="button"
        className={`${styles.sortButton} ${styles.sortButtonName} ${sortKey === 'name' ? styles.sortButtonActive : ''}`}
        onClick={() => onChange('name')}
      >
        한글명 {renderArrow('name')}
      </button>
      <button
        type="button"
        className={`${styles.sortButton} ${styles.sortButtonPrice} ${sortKey === 'price' ? styles.sortButtonActive : ''}`}
        onClick={() => onChange('price')}
      >
        현재가 {renderArrow('price')}
      </button>
      <button
        type="button"
        className={`${styles.sortButton} ${styles.sortButtonChange} ${sortKey === 'change' ? styles.sortButtonActive : ''}`}
        onClick={() => onChange('change')}
      >
        전일대비 {renderArrow('change')}
      </button>
      <button
        type="button"
        className={`${styles.sortButton} ${styles.sortButtonVolume} ${sortKey === 'volume' ? styles.sortButtonActive : ''}`}
        onClick={() => onChange('volume')}
      >
        거래대금 {renderArrow('volume')}
      </button>
    </div>
  )
}

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('KRW')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const [sortKey, setSortKey] = useState<SortKey>('volume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const listRef = useRef<HTMLUListElement>(null)
  const router = useRouter()

  const { data: coins } = useCoins()
  const { data: portfolio } = usePortfolio()
  const { selectedMarket, setSelectedMarket } = useMarketStore()
  const tickers = useTickerStore((state) => state.tickers)
  const tickerVersion = useTickerStore((state) => state.version)
  const favoriteMarkets = useFavoritesStore((state) => state.markets)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)

  const tabFilteredCoins = useMemo(() => {
    if (!coins) return []
    if (activeTab === 'holdings') {
      const heldMarkets = new Set(portfolio?.holdings.map((h) => h.market) ?? [])
      return coins.filter((c) => heldMarkets.has(c.market))
    }
    if (activeTab === 'favorites') {
      const favSet = new Set(favoriteMarkets)
      return coins.filter((c) => favSet.has(c.market))
    }
    return coins.filter((c) => c.market.startsWith(`${activeTab}-`))
  }, [coins, activeTab, portfolio, favoriteMarkets])

  const filteredCoins = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return tabFilteredCoins
    return tabFilteredCoins.filter(
      (coin) =>
        coin.market.toLowerCase().includes(term) ||
        coin.koreanName.toLowerCase().includes(term) ||
        coin.englishName.toLowerCase().includes(term)
    )
  }, [tabFilteredCoins, searchTerm])

  const sortedCoins = useMemo(() => {
    void tickerVersion
    const list = [...filteredCoins]
    const dir = sortDir === 'asc' ? 1 : -1
    list.sort((a, b) => {
      if (sortKey === 'name') return a.koreanName.localeCompare(b.koreanName) * dir
      const ta = tickers[a.market]
      const tb = tickers[b.market]
      const va =
        sortKey === 'price' ? ta?.tradePrice ?? 0
        : sortKey === 'change' ? ta?.changeRate ?? 0
        : ta?.accTradePrice24h ?? 0
      const vb =
        sortKey === 'price' ? tb?.tradePrice ?? 0
        : sortKey === 'change' ? tb?.changeRate ?? 0
        : tb?.accTradePrice24h ?? 0
      return (va - vb) * dir
    })
    return list
  }, [filteredCoins, sortKey, sortDir, tickers, tickerVersion])

  const visibleCoins = useMemo(
    () => sortedCoins.slice(0, visibleCount),
    [sortedCoins, visibleCount]
  )

  const handleSortChange = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir(key === 'name' ? 'asc' : 'desc')
      }
    },
    [sortKey]
  )

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [searchTerm, activeTab])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCoinClick = useCallback(
    (market: string) => {
      setSelectedMarket(market)
      router.push(`/trade/${market}`)
    },
    [router, setSelectedMarket]
  )

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < SCROLL_THRESHOLD && visibleCount < sortedCoins.length) {
      setVisibleCount((prev) => Math.min(prev + LOAD_STEP, sortedCoins.length))
    }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="코인명/심볼 검색"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tabButton} ${activeTab === t.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <SortHeader sortKey={sortKey} sortDir={sortDir} onChange={handleSortChange} />
      <ul ref={listRef} className={styles.coinList} onScroll={handleScroll}>
        {visibleCoins.length === 0 ? (
          <li className={styles.emptyState}>
            {activeTab === 'favorites'
              ? '관심 코인이 없습니다.'
              : activeTab === 'holdings'
                ? '보유 중인 코인이 없습니다.'
                : '표시할 코인이 없습니다.'}
          </li>
        ) : (
          visibleCoins.map((coin) => (
            <CoinRow
              key={coin.market}
              market={coin.market}
              koreanName={coin.koreanName}
              englishName={coin.englishName}
              isActive={selectedMarket === coin.market}
              isFavorite={favoriteMarkets.includes(coin.market)}
              onClick={handleCoinClick}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
        {visibleCount < sortedCoins.length && (
          <li className={styles.loadingMore}>
            {sortedCoins.length - visibleCount}개 더 불러오는 중...
          </li>
        )}
      </ul>
    </aside>
  )
}
