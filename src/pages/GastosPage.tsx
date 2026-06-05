import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { FirebaseError } from 'firebase/app'
import { db } from '../lib/firebase'
import { ensureAnonymousAuth } from '../lib/auth'
import ConfirmDialog from '../shared/ui/ConfirmDialog'

type Persona = { id: string; name: string }
type Gasto = { id: string; desc: string; amount: number; paidBy: string; date: number; splitWith: string[] }
type Transfer = { fromId: string; toId: string; amount: number }

const DEFAULT_PERSONAS: Persona[] = [
  { id: 'p1', name: 'Gaby' },
  { id: 'p2', name: 'Mile' },
  { id: 'p3', name: 'Lucas' },
  { id: 'p4', name: 'Nico' },
]

const ALL_IDS = DEFAULT_PERSONAS.map((p) => p.id)

const DOC_REF = doc(db, 'gastos', 'state')

function calcBalances(personas: Persona[], gastos: Gasto[]): Record<string, number> {
  const bal: Record<string, number> = {}
  personas.forEach((p) => (bal[p.id] = 0))
  gastos.forEach((g) => {
    const participants = g.splitWith?.length > 0 ? g.splitWith : personas.map((p) => p.id)
    if (bal[g.paidBy] !== undefined) bal[g.paidBy] += g.amount
    const share = g.amount / participants.length
    participants.forEach((id) => { if (bal[id] !== undefined) bal[id] -= share })
  })
  return bal
}

function calcTransfers(personas: Persona[], balances: Record<string, number>): Transfer[] {
  const transfers: Transfer[] = []
  const debtors = personas
    .filter((p) => balances[p.id] < -0.01)
    .map((p) => ({ id: p.id, bal: balances[p.id] }))
    .sort((a, b) => a.bal - b.bal)
  const creditors = personas
    .filter((p) => balances[p.id] > 0.01)
    .map((p) => ({ id: p.id, bal: balances[p.id] }))
    .sort((a, b) => b.bal - a.bal)

  let d = 0, c = 0
  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(-debtors[d].bal, creditors[c].bal)
    if (amount > 0.01)
      transfers.push({ fromId: debtors[d].id, toId: creditors[c].id, amount: Math.round(amount) })
    debtors[d].bal += amount
    creditors[c].bal -= amount
    if (Math.abs(debtors[d].bal) < 0.01) d++
    if (Math.abs(creditors[c].bal) < 0.01) c++
  }
  return transfers
}

export default function GastosPage() {
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS)
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('p1')
  const [splitWith, setSplitWith] = useState<string[]>(ALL_IDS)
  const [confirmPending, setConfirmPending] = useState<{ action: () => void } | null>(null)

  useEffect(() => {
    let unsub: null | (() => void) = null
    let cancelled = false
    setLoading(true)
    ensureAnonymousAuth()
      .then(() => {
        if (cancelled) return
        unsub = onSnapshot(
          DOC_REF,
          (snap) => {
            const data = snap.data()
            if (data?.personas) setPersonas(data.personas as Persona[])
            if (data?.gastos) setGastos(data.gastos as Gasto[])
            setLoading(false)
            setError(null)
          },
          (err) => {
            const e = err as FirebaseError
            setError(e?.code === 'permission-denied' ? 'Sin permisos.' : 'Error al cargar.')
            setLoading(false)
          }
        )
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo autenticar.')
          setLoading(false)
        }
      })
    return () => { cancelled = true; if (unsub) unsub() }
  }, [])

  async function persist(p: Persona[], g: Gasto[]) {
    try {
      await ensureAnonymousAuth()
      await setDoc(DOC_REF, { personas: p, gastos: g })
      setError(null)
    } catch (err) {
      const e = err as FirebaseError
      setError(e?.code === 'permission-denied' ? 'Sin permisos.' : 'Error al guardar.')
    }
  }

  async function addGasto() {
    const amt = parseFloat(amount)
    if (!desc.trim() || isNaN(amt) || amt <= 0 || splitWith.length === 0) return
    const next: Gasto[] = [
      { id: `g_${Date.now()}`, desc: desc.trim(), amount: amt, paidBy, date: Date.now(), splitWith: [...splitWith] },
      ...gastos,
    ]
    setGastos(next)
    setDesc('')
    setAmount('')
    setSplitWith(ALL_IDS)
    await persist(personas, next)
  }

  async function deleteGasto(id: string) {
    const next = gastos.filter((g) => g.id !== id)
    setGastos(next)
    await persist(personas, next)
  }

  function toggleSplit(id: string) {
    setSplitWith((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const balances = calcBalances(personas, gastos)
  const transfers = calcTransfers(personas, balances)
  const personaById = Object.fromEntries(personas.map((p) => [p.id, p.name]))
  const total = gastos.reduce((s, g) => s + g.amount, 0)

  return (
    <div className="page page--scrollable">
      <header className="header">
        <div className="badge">
          <span className="badge-emoji">💸</span>
          <span className="badge-text">Gastos</span>
        </div>
        <h1>Gastos</h1>
        <p className="sub">Quién pagó qué — sin dramas al final del viaje.</p>
      </header>

      {/* Agregar gasto */}
      <form className="card" onSubmit={(e) => { e.preventDefault(); addGasto() }}>
        <p className="gasto-label">Agregar gasto</p>
        <input
          className="gasto-input"
          placeholder="Descripción (ej: Almuerzo ramen)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={60}
        />
        <div className="gasto-row" style={{ marginBottom: 12 }}>
          <input
            className="gasto-input gasto-input--amount"
            placeholder="¥ Monto"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            style={{ marginBottom: 0 }}
          />
          <select
            className="gasto-select"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <p className="gasto-label" style={{ marginBottom: 8 }}>Dividir entre</p>
        <div className="gasto-split-grid">
          {personas.map((p) => {
            const on = splitWith.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`gasto-split-chip${on ? ' gasto-split-chip--on' : ''}`}
                onClick={() => toggleSplit(p.id)}
              >
                <span className="gasto-split-dot">
                  {on && (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                    </svg>
                  )}
                </span>
                {p.name}
              </button>
            )
          })}
        </div>

        <button
          className="gasto-add-btn-full"
          type="submit"
          disabled={!desc.trim() || !amount || parseFloat(amount) <= 0 || splitWith.length === 0}
        >
          Agregar
        </button>
      </form>

      {/* Balance */}
      {!loading && gastos.length > 0 && (
        <div className="card">
          <p className="gasto-label">Balance · total ¥{total.toLocaleString()}</p>
          <div className="gasto-balance-list">
            {personas.map((p) => {
              const bal = Math.round(balances[p.id] ?? 0)
              return (
                <div key={p.id} className="gasto-balance-row">
                  <span className="gasto-balance-name">{p.name}</span>
                  <span className={`gasto-balance-amount${bal > 0 ? ' gasto-balance--pos' : bal < 0 ? ' gasto-balance--neg' : ''}`}>
                    {bal > 0 ? '+' : ''}{bal.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>

          {transfers.length > 0 && (
            <>
              <p className="gasto-label" style={{ marginTop: 16 }}>Cómo saldar cuentas</p>
              <div className="gasto-transfers">
                {transfers.map((t, i) => (
                  <div key={i} className="gasto-transfer-row">
                    <span className="gasto-transfer-name">{personaById[t.fromId]}</span>
                    <span className="gasto-transfer-arrow">→</span>
                    <span className="gasto-transfer-name">{personaById[t.toId]}</span>
                    <span className="gasto-transfer-amount">¥{t.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Historial */}
      {loading ? (
        <p className="sub" style={{ textAlign: 'center' }}>Cargando…</p>
      ) : error ? (
        <p className="sub" style={{ textAlign: 'center' }}>{error}</p>
      ) : gastos.length > 0 ? (
        <div className="card" style={{ paddingBottom: 8 }}>
          <p className="gasto-label">Historial</p>
          <ul className="gasto-list" role="list">
            {gastos.map((g) => {
              const isPartial = g.splitWith?.length > 0 && g.splitWith.length < personas.length
              const splitNames = isPartial
                ? g.splitWith.map((id) => personaById[id] ?? id).join(', ')
                : null
              return (
                <li key={g.id} className="gasto-item">
                  <div className="gasto-item-info">
                    <span className="gasto-item-desc">{g.desc}</span>
                    <span className="gasto-item-meta">
                      {personaById[g.paidBy] ?? g.paidBy}
                      {splitNames ? ` → ${splitNames}` : ''} ·{' '}
                      {new Date(g.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="gasto-item-right">
                    <span className="gasto-item-amount">¥{g.amount.toLocaleString()}</span>
                    <button className="gasto-item-del" onClick={() => setConfirmPending({ action: () => deleteGasto(g.id) })} aria-label="Eliminar">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                      </svg>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {confirmPending && (
        <ConfirmDialog
          message="¿Eliminar este gasto?"
          onConfirm={() => { confirmPending.action(); setConfirmPending(null) }}
          onCancel={() => setConfirmPending(null)}
        />
      )}
    </div>
  )
}
