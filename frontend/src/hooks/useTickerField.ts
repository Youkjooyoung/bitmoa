import { useTickerStore } from '@/stores/tickerStore'
import type { Ticker } from '@/types'

export function useTickerField<K extends keyof Ticker>(
  market: string,
  field: K
): Ticker[K] | undefined {
  return useTickerStore((state) => state.tickers[market]?.[field])
}

export function useTicker(market: string): Ticker | undefined {
  return useTickerStore((state) => state.tickers[market])
}
