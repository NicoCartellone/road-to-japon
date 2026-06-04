import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { FirebaseError } from 'firebase/app'
import { db } from '../lib/firebase'
import { ensureAnonymousAuth } from '../lib/auth'
import ConfirmDialog from '../shared/ui/ConfirmDialog'

type Persona = { id: string; name: string }
type Gasto = { id: string; desc: string; amount: number; paidBy: string; date: number }
type Transfer = { fromId: string; toId: string; amount: number }

const DEFAULT_PERSONAS: Persona[] = [
  { id: 'p1', name: 'Viajero 1' },
  { id: 'p2', name: 'Viajero 2' },
  { id: 'p3', name: 'Viajero 3' },
  { id: 'p4', name: 'Viajero 4' },
]

const DOC_REF = doc(db, 'gastos', 'state')

function calcBalances(personas: Persona[], gastos: Gasto[]): Record<string, number> {
  const n = personas.length
  const bal: Record<string, number> = {}
  personas.forEach((p) => (bal[p.id] = 0))
  gastos.forEach((g) => {
    if (bal[g.paidBy] !== undefined) bal[g.paidBy] += g.amount
    const share = g.amount / n
    personas.forEach((p) => (bal[p.id] -= share))
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

  let d = 0,
    c = 0
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
  const [editingPersona, setEditingPersona] = useState<string | null>(null)
  const [personaDraft, setPersonaDraft] = useState('')
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
    return () => {
      cancelled = true
      if (unsub) unsub()
    }
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
    if (!desc.trim() || isNaN(amt) || amt <= 0) return
    const next = [
      { id: `g_${Date.now()}`, desc: desc.trim(), amount: amt, paidBy, date: Date.now() },
      ...gastos,
    ]
    setGastos(next)
    setDesc('')
    setAmount('')
    await persist(personas, next)
  }

  async function deleteGasto(id: string) {
    const next = gastos.filter((g) => g.id !== id)
    setGastos(next)
    await persist(personas, next)
  }

  async function savePersonaName(id: string) {
    const name = personaDraft.trim()
    setEditingPersona(null)
    if (!name) return
    const next = personas.map((p) => (p.id === id ? { ...p, name } : p))
    setPersonas(next)
    await persist(next, gastos)
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

      {/* Viajeros */}
      <div className="card">
        <p className="gasto-label">Viajeros — tap para renombrar</p>
        <div className="gasto-personas">
          {personas.map((p) =>
            editingPersona === p.id ? (
              <input
                key={p.id}
                className="gasto-persona-input"
                value={personaDraft}
                onChange={(e) => setPersonaDraft(e.target.value)}
                onBlur={() => savePersonaName(p.id)}
                onKeyDown={(e) => e.key === 'Enter' && savePersonaName(p.id)}
                autoFocus
                maxLength={12}
              />
            ) : (
              <button
                key={p.id}
                className="gasto-persona-btn"
                onClick={() => {
                  setEditingPersona(p.id)
                  setPersonaDraft(p.name)
                }}
              >
                {p.name}
              </button>
            )
          )}
        </div>
      </div>

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
                  <span
                    className={`gasto-balance-amount${bal > 0 ? ' gasto-balance--pos' : bal < 0 ? ' gasto-balance--neg' : ''}`}
                  >
                    {bal > 0 ? '+' : ''}
                    {bal.toLocaleString()}
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
        <div className="gasto-row">
          <input
            className="gasto-input gasto-input--amount"
            placeholder="¥ Monto"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
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
          <button
            className="gasto-add-btn"
            type="submit"
            disabled={!desc.trim() || !amount || parseFloat(amount) <= 0}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Historial */}
      {loading ? (
        <p className="sub" style={{ textAlign: 'center' }}>Cargando…</p>
      ) : error ? (
        <p className="sub" style={{ textAlign: 'center' }}>{error}</p>
      ) : gastos.length > 0 ? (
        <div className="card" style={{ paddingBottom: 8 }}>
          <p className="gasto-label">Historial</p>
          <ul className="gasto-list" role="list">
            {gastos.map((g) => (
              <li key={g.id} className="gasto-item">
                <div className="gasto-item-info">
                  <span className="gasto-item-desc">{g.desc}</span>
                  <span className="gasto-item-meta">
                    {personaById[g.paidBy] ?? g.paidBy} ·{' '}
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
            ))}
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
