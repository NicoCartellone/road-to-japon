import { ARS_PER_USD_BLUE, JPY_PER_USD } from './rates'

export function convertFromJpy(jpy: number) {
  const safe = Number.isFinite(jpy) ? Math.max(0, jpy) : 0
  const usd = safe / JPY_PER_USD
  const ars = usd * ARS_PER_USD_BLUE

  return { usd, ars }
}
