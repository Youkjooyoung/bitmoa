'use client'

import { useMemo } from 'react'
import styles from './AssetPieChart.module.css'

export interface PieSlice {
  name: string
  value: number
  color: string
}

interface AssetPieChartProps {
  data: PieSlice[]
  size?: number
}

const PALETTE = [
  '#f0b90b',
  '#3b82f6',
  '#10b981',
  '#f97316',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#ef4444',
  '#84cc16',
]

export function assignColors<T extends { name: string }>(items: T[]): (T & { color: string })[] {
  return items.map((item, i) => ({ ...item, color: PALETTE[i % PALETTE.length] }))
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

export default function AssetPieChart({ data, size = 240 }: AssetPieChartProps) {
  const visibleData = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    if (total <= 0) return []
    return data.filter((d) => d.value > 0 && (d.value / total) >= 0.001)
  }, [data])

  const total = useMemo(() => visibleData.reduce((sum, d) => sum + d.value, 0), [visibleData])

  const slices = useMemo(() => {
    if (total <= 0) return []
    let cumulative = 0
    return visibleData.map((d) => {
      const startAngle = (cumulative / total) * 360
      cumulative += d.value
      const endAngle = (cumulative / total) * 360
      const percent = (d.value / total) * 100
      return { ...d, startAngle, endAngle, percent }
    })
  }, [visibleData, total])

  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 2

  if (total <= 0) {
    return (
      <div className={styles.emptyWrap} style={{ width: size, height: size }}>
        <span className={styles.emptyText}>데이터 없음</span>
      </div>
    )
  }

  const isSingleSlice = slices.length === 1 || (slices[0]?.percent ?? 0) >= 99.9

  return (
    <div className={styles.pieWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {isSingleSlice ? (
          <circle cx={cx} cy={cy} r={radius} fill={slices[0].color} />
        ) : (
          slices.map((s, i) => (
            <path
              key={`${s.name}-${i}`}
              d={describeArc(cx, cy, radius, s.startAngle, s.endAngle)}
              fill={s.color}
              stroke="#1e2329"
              strokeWidth={1.5}
            />
          ))
        )}
        <circle cx={cx} cy={cy} r={radius * 0.55} fill="#1e2329" />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="#848e9c"
          fontSize="11"
        >
          총 자산
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill="#f0f0f0"
          fontSize="14"
          fontWeight="600"
        >
          100%
        </text>
      </svg>
    </div>
  )
}
