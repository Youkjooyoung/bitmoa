'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  LogicalRange,
  Time,
} from 'lightweight-charts'
import api from '@/lib/axios'
import type { ApiResponse, Candle } from '@/types'
import ChartPeriodTabs, { ChartPeriod, CHART_PERIODS } from './ChartPeriodTabs'
import styles from './PriceChart.module.css'

interface PriceChartProps {
  market: string
}

const INITIAL_COUNT = 200
const OLDER_COUNT = 200
const LOAD_TRIGGER = 10

async function fetchCandles(
  market: string,
  type: string,
  unit: number,
  count: number,
  to?: string
): Promise<Candle[]> {
  const params = new URLSearchParams({ type, unit: String(unit), count: String(count) })
  if (to) params.set('to', to)
  const response = await api.get<ApiResponse<Candle[]>>(
    `/api/coins/${market}/candles?${params.toString()}`
  )
  return response.data.data
}

export default function PriceChart({ market }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const [period, setPeriod] = useState<ChartPeriod>(
    CHART_PERIODS.find((p) => p.type === 'minutes' && p.unit === 30) ?? CHART_PERIODS[0]
  )
  const [candles, setCandles] = useState<Candle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const earliestTimestampRef = useRef<string | null>(null)

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const chart = createChart(container, {
      width: container.clientWidth || 800,
      height: container.clientHeight || 400,
      layout: {
        background: { color: '#1e2329' },
        textColor: '#848e9c',
      },
      grid: {
        vertLines: { color: '#2b3139' },
        horzLines: { color: '#2b3139' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: '#2b3139',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#2b3139',
        timeVisible: true,
      },
    })

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#c84a31',
      downColor: '#1261c4',
      borderUpColor: '#c84a31',
      borderDownColor: '#1261c4',
      wickUpColor: '#c84a31',
      wickDownColor: '#1261c4',
    })

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    chartRef.current = chart
    candleSeriesRef.current = candlestickSeries
    volumeSeriesRef.current = volumeSeries

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          chart.resize(Math.floor(width), Math.floor(height), true)
        }
      }
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setIsError(false)
    setCandles([])
    hasMoreRef.current = true
    earliestTimestampRef.current = null
    loadingMoreRef.current = false

    fetchCandles(market, period.type, period.unit, INITIAL_COUNT)
      .then((data) => {
        if (cancelled) return
        setCandles(data)
        setIsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setIsError(true)
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [market, period])

  const loadOlder = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return
    const earliest = earliestTimestampRef.current
    if (!earliest) return
    loadingMoreRef.current = true
    try {
      const older = await fetchCandles(market, period.type, period.unit, OLDER_COUNT, earliest)
      if (older.length <= 1) {
        hasMoreRef.current = false
        return
      }
      setCandles((prev) => {
        const seen = new Set(prev.map((c) => c.timestamp))
        const merged = [...prev]
        for (const c of older) {
          if (!seen.has(c.timestamp)) merged.push(c)
        }
        return merged
      })
    } catch {
      hasMoreRef.current = false
    } finally {
      loadingMoreRef.current = false
    }
  }, [market, period])

  const sortedData = useMemo(() => {
    return [...candles]
      .map((candle) => ({
        timestamp: candle.timestamp,
        time: (new Date(candle.timestamp).getTime() / 1000) as Time,
        open: Number(candle.openingPrice),
        high: Number(candle.highPrice),
        low: Number(candle.lowPrice),
        close: Number(candle.tradePrice),
        volume: Number(candle.candleAccTradeVolume),
      }))
      .filter((d) => Number.isFinite(d.open) && Number.isFinite(d.close))
      .sort((a, b) => (a.time as number) - (b.time as number))
  }, [candles])

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || sortedData.length === 0) return

    const candleData: CandlestickData<Time>[] = sortedData.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    const volumeData: HistogramData<Time>[] = sortedData.map((d) => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(200, 74, 49, 0.6)' : 'rgba(18, 97, 196, 0.6)',
    }))

    const sampleClose = sortedData[sortedData.length - 1].close
    const precision =
      sampleClose >= 100 ? 0 : sampleClose >= 1 ? 2 : sampleClose >= 0.01 ? 4 : 8
    const minMove = 1 / Math.pow(10, precision)
    candleSeriesRef.current.applyOptions({
      priceFormat: { type: 'price', precision, minMove },
    })

    candleSeriesRef.current.setData(candleData)
    volumeSeriesRef.current.setData(volumeData)
    earliestTimestampRef.current = sortedData[0].timestamp
  }, [sortedData])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const handler = (range: LogicalRange | null) => {
      if (!range) return
      if (range.from < LOAD_TRIGGER) {
        loadOlder()
      }
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(handler)
    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handler)
    }
  }, [loadOlder])

  const handleRetry = () => {
    setPeriod({ ...period })
  }

  return (
    <div className={styles.container}>
      <ChartPeriodTabs value={period} onChange={setPeriod} />
      <div ref={chartContainerRef} className={styles.chart} />
      {isLoading && <div className={styles.overlay}>차트 로딩중...</div>}
      {isError && !isLoading && (
        <div className={styles.overlay}>
          <div className={styles.errorBox}>
            <p className={styles.errorMessage}>차트 데이터를 불러오지 못했습니다.</p>
            <button className={styles.retryButton} onClick={handleRetry}>
              다시 시도
            </button>
          </div>
        </div>
      )}
      {!isLoading && !isError && candles.length === 0 && (
        <div className={styles.overlay}>표시할 차트 데이터가 없습니다.</div>
      )}
    </div>
  )
}
