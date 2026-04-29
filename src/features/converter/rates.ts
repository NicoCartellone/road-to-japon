/**
 * Cotizaciones HARDCODEADAS.
 *
 * Actualizá estos valores cuando quieras (por ejemplo, semanalmente).
 * Fuentes usadas el día de actualización:
 * - USD/JPY: https://open.er-api.com/v6/latest/USD
 * - Dólar blue (ARS/USD): https://api.bluelytics.com.ar/v2/latest
 */

export const RATES_AS_OF = '2026-04-29' as const

// 1 USD = X JPY
export const JPY_PER_USD = 159.540055 as const

// 1 USD = X ARS (blue promedio)
export const ARS_PER_USD_BLUE = 1410 as const
