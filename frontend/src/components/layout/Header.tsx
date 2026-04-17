'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { useCurrencyStore, type Currency } from '@/stores/currencyStore'
import { useTickerStore } from '@/stores/tickerStore'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'
import styles from './Header.module.css'

const CURRENCY_LABEL: Record<Currency, string> = {
  KRW: '원',
  USD: 'USD',
  JPY: 'JPY',
  BTC: 'BTC',
}

const KRW_PER_JPY = 9.3

function convertFromKrw(amountKrw: number, currency: Currency, usdtPrice: number, btcPrice: number) {
  if (currency === 'KRW') return amountKrw
  if (currency === 'USD') return usdtPrice > 0 ? amountKrw / usdtPrice : 0
  if (currency === 'JPY') return amountKrw / KRW_PER_JPY
  if (currency === 'BTC') return btcPrice > 0 ? amountKrw / btcPrice : 0
  return amountKrw
}

function formatConverted(value: number, currency: Currency) {
  if (currency === 'KRW') return `${formatNumber(value, 0)}원`
  if (currency === 'USD') return `$${formatNumber(value, 2)}`
  if (currency === 'JPY') return `¥${formatNumber(value, 0)}`
  return `${value.toFixed(8)} BTC`
}

export default function Header() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()
  const { data: userData } = useUser()
  const logoutMutation = useLogout()
  const { currency, hidden, setCurrency, toggleHidden } = useCurrencyStore()
  const tickers = useTickerStore((s) => s.tickers)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const currentUser = userData || user
  const usdtPrice = tickers['KRW-USDT']?.tradePrice || 0
  const btcPrice = tickers['KRW-BTC']?.tradePrice || 0
  const balance = currentUser?.balance || 0
  const convertedBalance = convertFromKrw(balance, currency, usdtPrice, btcPrice)

  const handleCurrencySelect = (c: Currency) => {
    setCurrency(c)
    setMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <Link href="/" className={styles.logo}>
          비트모아
        </Link>
        <Link
          href="/trade/KRW-BTC"
          className={`${styles.navLink} ${pathname.startsWith('/trade') ? styles.navLinkActive : ''}`}
        >
          거래소
        </Link>
        {isAuthenticated && (
          <>
            <Link
              href="/portfolio"
              className={`${styles.navLink} ${pathname === '/portfolio' ? styles.navLinkActive : ''}`}
            >
              투자내역
            </Link>
            <Link
              href="/history"
              className={`${styles.navLink} ${pathname === '/history' ? styles.navLinkActive : ''}`}
            >
              거래내역
            </Link>
          </>
        )}
      </div>

      <div className={styles.userSection}>
        {isAuthenticated && currentUser ? (
          <>
            <div className={styles.balanceBox} ref={menuRef}>
              <button
                type="button"
                className={styles.eyeButton}
                onClick={toggleHidden}
                aria-label={hidden ? '잔액 표시' : '잔액 숨김'}
                title={hidden ? '잔액 표시' : '잔액 숨김'}
              >
                {hidden ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className={styles.balanceButton}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className={styles.balanceLabel}>보유 {CURRENCY_LABEL[currency]}</span>
                <span className={styles.balanceValue}>
                  {hidden ? '****' : formatConverted(convertedBalance, currency)}
                </span>
                <svg className={styles.caret} width="10" height="10" viewBox="0 0 10 10">
                  <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
              {menuOpen && (
                <div className={styles.currencyMenu}>
                  {(['KRW', 'USD', 'JPY', 'BTC'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.currencyItem} ${c === currency ? styles.currencyItemActive : ''}`}
                      onClick={() => handleCurrencySelect(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.userInfo}>{currentUser.nickname}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </>
        ) : (
          <div className={styles.authButtons}>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="default" size="sm">
                회원가입
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
