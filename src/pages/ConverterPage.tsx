import { useMemo, useState } from 'react'
import { convertFromJpy } from '../features/converter/convert'
import { ARS_PER_USD_BLUE, JPY_PER_USD, RATES_AS_OF } from '../features/converter/rates'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

function formatArs(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default function ConverterPage() {
  const [jpyText, setJpyText] = useState('')
  const jpy = useMemo(() => {
    const normalized = jpyText.replace(/\./g, '').replace(',', '.')
    const n = Number(normalized)
    return Number.isFinite(n) ? n : 0
  }, [jpyText])

  const { usd, ars } = useMemo(() => convertFromJpy(jpy), [jpy])

  return (
    <div className="page">
      <header className="header">
        <div className="badge">💱 Conversor</div>
        <h1>Conversor</h1>
        <p className="sub">Convertí precios en yenes para tener referencia en USD y ARS (dólar blue).</p>
      </header>

      <section className="card" aria-label="Conversor">
        <div className="conv">
          <div className="conv-field">
            <label className="conv-label" htmlFor="jpy">
              Yenes (JPY)
            </label>
            <input
              id="jpy"
              inputMode="decimal"
              className="conv-input"
              placeholder="1000"
              value={jpyText}
              onChange={(e) => setJpyText(e.target.value)}
            />
            <div className="conv-hint">
              Cotizaciones hardcodeadas (al {RATES_AS_OF}): 1 USD = {round2(JPY_PER_USD)} JPY · 1 USD = {ARS_PER_USD_BLUE}{' '}
              ARS (blue)
            </div>
          </div>

          <div className="conv-results" aria-label="Resultados">
            <div className="conv-result">
              <div className="conv-result-title">USD</div>
              <div className="conv-result-value">{formatUsd(usd)}</div>
            </div>
            <div className="conv-result">
              <div className="conv-result-title">ARS</div>
              <div className="conv-result-value">{formatArs(ars)}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
