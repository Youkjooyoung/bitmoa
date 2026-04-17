'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useTickerStore } from '@/stores/tickerStore'
import { useOrderFormStore } from '@/stores/orderFormStore'
import { useCreateOrder } from '@/hooks/useOrders'
import { useUser } from '@/hooks/useUser'
import { usePortfolio } from '@/hooks/usePortfolio'
import { formatNumber, formatPrice } from '@/lib/utils'
import { toast } from '@/stores/toastStore'
import styles from './OrderForm.module.css'

interface OrderFormProps {
  market: string
}

export default function OrderForm({ market }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY')
  const [orderMethod, setOrderMethod] = useState<'LIMIT' | 'MARKET'>('LIMIT')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  const { isAuthenticated } = useAuthStore()
  const { tickers } = useTickerStore()
  const presetPrice = useOrderFormStore((state) => state.presetPrice)
  const presetNonce = useOrderFormStore((state) => state.presetNonce)
  const { data: user } = useUser()
  const { data: portfolio } = usePortfolio()
  const createOrderMutation = useCreateOrder()

  const ticker = tickers[market]
  const holding = portfolio?.holdings.find((h) => h.market === market)

  const handleOrderTypeChange = (type: 'BUY' | 'SELL') => {
    setOrderType(type)
    setQuantity('')
  }

  const handleOrderMethodChange = (method: 'LIMIT' | 'MARKET') => {
    setOrderMethod(method)
    if (method === 'MARKET') {
      setPrice('')
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value)
  }

  const handlePercentClick = (percent: number) => {
    if (!ticker?.tradePrice) return

    const currentPrice = orderMethod === 'MARKET' ? ticker.tradePrice : parseFloat(price) || ticker.tradePrice
    if (!currentPrice) return

    if (orderType === 'BUY') {
      const balance = user?.balance ?? portfolio?.balance ?? 0
      if (balance <= 0) return
      const FEE_RATE = 0.0005
      const spendable = (balance * (percent / 100)) / (1 + FEE_RATE)
      const qty = Math.floor((spendable / currentPrice) * 1e8) / 1e8
      setQuantity(qty.toFixed(8))
    } else if (holding) {
      const qty = Math.floor(holding.quantity * (percent / 100) * 1e8) / 1e8
      setQuantity(qty.toFixed(8))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const orderPrice = orderMethod === 'MARKET' ? undefined : parseFloat(price)
    const orderQuantity = parseFloat(quantity)

    if (!orderQuantity || (orderMethod === 'LIMIT' && !orderPrice)) return

    try {
      await createOrderMutation.mutateAsync({
        market,
        orderType,
        orderMethod,
        price: orderPrice,
        quantity: orderQuantity,
      })
      setPrice('')
      setQuantity('')
      toast.success(`${orderType === 'BUY' ? '매수' : '매도'} 주문이 접수되었습니다.`)
    } catch {
      toast.error('주문에 실패했습니다.')
    }
  }

  const totalAmount = useMemo(() => {
    const currentPrice = orderMethod === 'MARKET' ? ticker?.tradePrice : parseFloat(price)
    const qty = parseFloat(quantity)
    if (!currentPrice || !qty) return 0
    return currentPrice * qty
  }, [price, quantity, orderMethod, ticker])

  const availableAmount = useMemo(() => {
    if (orderType === 'BUY') {
      return user?.balance || 0
    }
    return holding?.quantity || 0
  }, [orderType, user, holding])

  useEffect(() => {
    if (ticker?.tradePrice && !price && orderMethod === 'LIMIT') {
      setPrice(ticker.tradePrice.toString())
    }
  }, [ticker, market])

  useEffect(() => {
    if (presetPrice == null) return
    setPrice(presetPrice.toString())
    if (orderMethod === 'MARKET') {
      setOrderMethod('LIMIT')
    }
  }, [presetPrice, presetNonce])

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginMessage}>
          주문을 하려면{' '}
          <Link href="/login" className={styles.loginLink}>
            로그인
          </Link>
          이 필요합니다.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${styles.tabBuy} ${orderType === 'BUY' ? styles.active : ''}`}
          onClick={() => handleOrderTypeChange('BUY')}
        >
          매수
        </button>
        <button
          className={`${styles.tab} ${styles.tabSell} ${orderType === 'SELL' ? styles.active : ''}`}
          onClick={() => handleOrderTypeChange('SELL')}
        >
          매도
        </button>
      </div>

      <div className={styles.methodTabs}>
        <button
          className={`${styles.methodTab} ${orderMethod === 'LIMIT' ? styles.active : ''}`}
          onClick={() => handleOrderMethodChange('LIMIT')}
        >
          지정가
        </button>
        <button
          className={`${styles.methodTab} ${orderMethod === 'MARKET' ? styles.active : ''}`}
          onClick={() => handleOrderMethodChange('MARKET')}
        >
          시장가
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <div className={styles.label}>
            <span>가격</span>
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              className={styles.input}
              value={orderMethod === 'MARKET' ? '' : price}
              onChange={handlePriceChange}
              placeholder={orderMethod === 'MARKET' ? '시장가' : '0'}
              step="any"
              disabled={orderMethod === 'MARKET'}
            />
            <span className={styles.unit}>KRW</span>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>
            <span>수량</span>
            <span className={styles.available}>
              {orderType === 'BUY' ? `${formatNumber(availableAmount, 0)} KRW` : `${formatNumber(availableAmount, 8)}`}
            </span>
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              className={styles.input}
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="0"
              step="any"
            />
            <span className={styles.unit}>{market.split('-')[1]}</span>
          </div>
        </div>

        <div className={styles.percentButtons}>
          {[10, 25, 50, 100].map((percent) => (
            <button
              key={percent}
              type="button"
              className={styles.percentButton}
              onClick={() => handlePercentClick(percent)}
            >
              {percent}%
            </button>
          ))}
        </div>

        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>총 {orderType === 'BUY' ? '매수' : '매도'} 금액</span>
          <span className={styles.totalValue}>{formatNumber(totalAmount, 0)} KRW</span>
        </div>

        <button
          type="submit"
          className={`${styles.submitButton} ${orderType === 'BUY' ? styles.buyButton : styles.sellButton}`}
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending
            ? '주문 중...'
            : `${orderType === 'BUY' ? '매수' : '매도'}하기`}
        </button>
      </form>
    </div>
  )
}
