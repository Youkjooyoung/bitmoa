'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePortfolio, usePortfolioSummary } from '@/hooks/usePortfolio'
import { useResetBalance } from '@/hooks/useUser'
import { formatNumber, formatPercent, formatPrice } from '@/lib/utils'
import { toast } from '@/stores/toastStore'
import AssetPieChart, { assignColors } from '@/components/portfolio/AssetPieChart'
import styles from './page.module.css'

export default function PortfolioPage() {
  const { isAuthenticated } = useAuthStore()
  const { data: portfolio } = usePortfolio()
  const { data: summary } = usePortfolioSummary()
  const resetMutation = useResetBalance()

  const handleReset = async () => {
    if (confirm('잔액을 1,000만원으로 초기화하시겠습니까? 보유 자산은 유지됩니다.')) {
      try {
        await resetMutation.mutateAsync()
        toast.success('잔액이 초기화되었습니다.')
      } catch {
        toast.error('잔액 초기화에 실패했습니다.')
      }
    }
  }

  const getProfitClass = (value: number) => {
    if (value > 0) return styles.profitRise
    if (value < 0) return styles.profitFall
    return ''
  }

  const pieSlices = useMemo(() => {
    if (!portfolio) return []
    const holdings = portfolio.holdings.map((h) => ({
      name: h.koreanName,
      market: h.market,
      value: h.evaluationAmount,
    }))
    const withKrw = [
      ...holdings,
      { name: '보유 KRW', market: 'KRW', value: portfolio.balance },
    ].filter((s) => s.value > 0)
    return assignColors(withKrw)
  }, [portfolio])

  const totalAssetValue = useMemo(
    () => pieSlices.reduce((sum, s) => sum + s.value, 0),
    [pieSlices]
  )

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>투자내역</h1>
        <div className={styles.empty}>로그인 후 이용할 수 있습니다.</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>투자내역</h1>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>총 보유자산</div>
          <div className={styles.cardValue}>{formatNumber(summary?.totalAsset || 0, 0)}원</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>보유 KRW</div>
          <div className={styles.cardValue}>{formatNumber(portfolio?.balance || 0, 0)}원</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>총 평가손익</div>
          <div className={`${styles.cardValue} ${getProfitClass(summary?.totalProfitLoss || 0)}`}>
            {formatNumber(summary?.totalProfitLoss || 0, 0)}원
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>총 수익률</div>
          <div className={`${styles.cardValue} ${getProfitClass(summary?.totalProfitLossRate || 0)}`}>
            {formatPercent(summary?.totalProfitLossRate || 0)}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.resetButton} onClick={handleReset} disabled={resetMutation.isPending}>
          {resetMutation.isPending ? '초기화 중...' : '잔액 초기화'}
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>자산 구성</h2>
        <div className={styles.pieBlock}>
          <AssetPieChart data={pieSlices} size={240} />
          <div className={styles.legend}>
            {pieSlices.length === 0 ? (
              <div className={styles.empty}>보유 자산이 없습니다.</div>
            ) : (
              <table className={styles.legendTable}>
                <thead>
                  <tr>
                    <th></th>
                    <th>자산</th>
                    <th className={styles.numCol}>금액</th>
                    <th className={styles.numCol}>비중</th>
                  </tr>
                </thead>
                <tbody>
                  {pieSlices.map((s) => {
                    const pct = totalAssetValue > 0 ? (s.value / totalAssetValue) * 100 : 0
                    return (
                      <tr key={s.market}>
                        <td>
                          <span className={styles.swatch} style={{ backgroundColor: s.color }} />
                        </td>
                        <td>{s.name}</td>
                        <td className={styles.numCol}>{formatNumber(s.value, 0)}원</td>
                        <td className={styles.numCol}>{pct.toFixed(2)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>보유자산</h2>
        {!portfolio?.holdings.length ? (
          <div className={styles.empty}>보유 중인 자산이 없습니다.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>코인</th>
                <th>보유수량</th>
                <th>매수평균가</th>
                <th>현재가</th>
                <th>평가금액</th>
                <th>평가손익</th>
                <th>수익률</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((holding) => (
                <tr key={holding.market}>
                  <td>{holding.koreanName}</td>
                  <td>{formatNumber(holding.quantity, 8)}</td>
                  <td>{formatPrice(holding.avgBuyPrice)}</td>
                  <td>{formatPrice(holding.currentPrice)}</td>
                  <td>{formatNumber(holding.evaluationAmount, 0)}원</td>
                  <td className={getProfitClass(holding.profitLoss)}>{formatNumber(holding.profitLoss, 0)}원</td>
                  <td className={getProfitClass(holding.profitLossRate)}>{formatPercent(holding.profitLossRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
