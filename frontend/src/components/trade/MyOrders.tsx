'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useOrders, useCancelOrder } from '@/hooks/useOrders'
import { formatPrice, formatQuantity } from '@/lib/utils'
import { toast } from '@/stores/toastStore'
import styles from './MyOrders.module.css'

interface MyOrdersProps {
  market?: string
}

export default function MyOrders({ market }: MyOrdersProps) {
  const [tab, setTab] = useState<'pending' | 'filled'>('pending')
  const [scope, setScope] = useState<'current' | 'all'>('current')

  const { isAuthenticated } = useAuthStore()
  const { data: ordersData } = useOrders(tab === 'pending' ? 'PENDING' : 'FILLED')
  const cancelMutation = useCancelOrder()
  const queryClient = useQueryClient()
  const prevPendingIdsRef = useRef<Set<number> | null>(null)
  const cancelledIdsRef = useRef<Set<number>>(new Set())

  const pendingIdsKey = tab === 'pending'
    ? (ordersData?.content ?? []).map((o) => o.id).sort().join(',')
    : null

  useEffect(() => {
    if (pendingIdsKey === null) {
      prevPendingIdsRef.current = null
      return
    }
    const currentIds = new Set(
      (ordersData?.content ?? []).map((o) => o.id)
    )
    const prev = prevPendingIdsRef.current
    if (prev !== null) {
      const removed: number[] = []
      prev.forEach((id) => {
        if (!currentIds.has(id)) removed.push(id)
      })
      if (removed.length > 0) {
        queryClient.refetchQueries({ queryKey: ['user'] })
        queryClient.refetchQueries({ queryKey: ['portfolio'] })
        queryClient.refetchQueries({ queryKey: ['orders', 'FILLED'] })
        const filled = removed.filter((id) => !cancelledIdsRef.current.has(id))
        if (filled.length > 0) {
          toast.success(
            filled.length === 1
              ? '주문이 체결되었습니다.'
              : `${filled.length}건의 주문이 체결되었습니다.`
          )
        }
        removed.forEach((id) => cancelledIdsRef.current.delete(id))
      }
    }
    prevPendingIdsRef.current = currentIds
  }, [pendingIdsKey, ordersData, queryClient])

  const handleTabChange = (newTab: 'pending' | 'filled') => {
    setTab(newTab)
  }

  const handleCancel = async (orderId: number) => {
    if (confirm('주문을 취소하시겠습니까?')) {
      try {
        cancelledIdsRef.current.add(orderId)
        await cancelMutation.mutateAsync(orderId)
        toast.success('주문이 취소되었습니다.')
      } catch {
        cancelledIdsRef.current.delete(orderId)
        toast.error('주문 취소에 실패했습니다.')
      }
    }
  }

  const getTypeClass = (type: string) => {
    return type === 'BUY' ? styles.typeBuy : styles.typeSell
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PARTIAL':
        return styles.statusPending
      case 'FILLED':
        return styles.statusFilled
      default:
        return styles.statusCancelled
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기'
      case 'PARTIAL':
        return '부분체결'
      case 'FILLED':
        return '완료'
      case 'CANCELLED':
        return '취소'
      default:
        return status
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <span className={styles.loginMessage}>로그인 후 주문 내역을 확인할 수 있습니다.</span>
        </div>
      </div>
    )
  }

  const allOrders = ordersData?.content || []
  const orders = scope === 'current' && market
    ? allOrders.filter((order) => order.market === market)
    : allOrders

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>주문내역</span>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'pending' ? styles.active : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            미체결
          </button>
          <button
            className={`${styles.tab} ${tab === 'filled' ? styles.active : ''}`}
            onClick={() => handleTabChange('filled')}
          >
            체결
          </button>
          {market && (
            <div className={styles.scopeToggle}>
              <button
                className={`${styles.scopeButton} ${scope === 'current' ? styles.scopeActive : ''}`}
                onClick={() => setScope('current')}
              >
                {market.split('-')[1] ?? market}
              </button>
              <button
                className={`${styles.scopeButton} ${scope === 'all' ? styles.scopeActive : ''}`}
                onClick={() => setScope('all')}
              >
                전체
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {orders.length === 0 ? (
          <div className={styles.empty}>주문 내역이 없습니다.</div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>마켓</th>
                <th>구분</th>
                <th>가격</th>
                <th>수량</th>
                <th>체결</th>
                <th>상태</th>
                {tab === 'pending' && <th></th>}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.market}</td>
                  <td className={getTypeClass(order.orderType)}>{order.orderType === 'BUY' ? '매수' : '매도'}</td>
                  <td>{formatPrice(order.price)}</td>
                  <td>{formatQuantity(order.quantity)}</td>
                  <td>{formatQuantity(order.filledQuantity)}</td>
                  <td className={getStatusClass(order.status)}>{getStatusText(order.status)}</td>
                  {tab === 'pending' && (
                    <td>
                      <button className={styles.cancelButton} onClick={() => handleCancel(order.id)}>
                        취소
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
