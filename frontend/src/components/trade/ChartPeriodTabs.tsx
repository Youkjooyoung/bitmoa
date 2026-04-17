'use client'

import styles from './ChartPeriodTabs.module.css'

export interface ChartPeriod {
  label: string
  type: 'minutes' | 'days' | 'weeks' | 'months'
  unit: number
}

export const CHART_PERIODS: ChartPeriod[] = [
  { label: '1분', type: 'minutes', unit: 1 },
  { label: '3분', type: 'minutes', unit: 3 },
  { label: '5분', type: 'minutes', unit: 5 },
  { label: '15분', type: 'minutes', unit: 15 },
  { label: '30분', type: 'minutes', unit: 30 },
  { label: '1시간', type: 'minutes', unit: 60 },
  { label: '4시간', type: 'minutes', unit: 240 },
  { label: '일', type: 'days', unit: 1 },
  { label: '주', type: 'weeks', unit: 1 },
  { label: '월', type: 'months', unit: 1 },
]

interface ChartPeriodTabsProps {
  value: ChartPeriod
  onChange: (period: ChartPeriod) => void
}

export default function ChartPeriodTabs({ value, onChange }: ChartPeriodTabsProps) {
  return (
    <div className={styles.tabs}>
      {CHART_PERIODS.map((period) => {
        const active = period.type === value.type && period.unit === value.unit
        return (
          <button
            key={`${period.type}-${period.unit}`}
            className={`${styles.tab} ${active ? styles.tabActive : ''}`}
            onClick={() => onChange(period)}
            type="button"
          >
            {period.label}
          </button>
        )
      })}
    </div>
  )
}
