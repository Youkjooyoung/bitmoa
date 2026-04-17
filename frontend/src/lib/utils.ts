import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPrice(value: number): string {
  if (value >= 100) {
    return formatNumber(value, 0)
  } else if (value >= 1) {
    return formatNumber(value, 2)
  } else if (value >= 0.01) {
    return formatNumber(value, 4)
  } else {
    return formatNumber(value, 8)
  }
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(2)}%`
}

export function formatQuantity(value: number): string {
  if (value >= 1) {
    return formatNumber(value, 4)
  }
  return formatNumber(value, 8)
}
