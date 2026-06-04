import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { FirebaseError } from 'firebase/app'
import { db } from '../lib/firebase'
import { ensureAnonymousAuth } from '../lib/auth'
import ConfirmDialog from '../shared/ui/ConfirmDialog'

type ItemDef = { id: string; text: string }
type Section = 'tareas' | 'equipaje'

const ITEMS: Record<Section, ItemDef[]> = {
  tareas: [
    { id: 't01', text: 'Sacar visa de Japón' },
    { id: 't02', text: 'Comprar pasaje de avión' },
    { id: 't03', text: 'Comprar seguro de viaje' },
    { id: 't04', text: 'Reservar alojamiento' },
    { id: 't05', text: 'Comprar JR Pass' },
    { id: 't06', text: 'Conseguir SIM japonesa o eSIM' },
    { id: 't07', text: 'Notificar al banco / tarjeta' },
    { id: 't08', text: 'Chequear vacunas necesarias' },
    { id: 't09', text: 'Descargar Google Maps offline' },
    { id: 't10', text: 'Descargar Google Translate (japonés)' },
    { id: 't11', text: 'Descargar app Hyperdia o Navitime' },
    { id: 't12', text: 'Cambiar divisa / conseguir yenes' },
    { id: 't13', text: 'Hacer fotocopias del pasaporte' },
  ],
  equipaje: [
    { id: 'e01', text: 'Pasaporte vigente' },
    { id: 'e02', text: 'Documentos de viaje impresos' },
    { id: 'e03', text: 'Adaptador de enchufes (tipo A)' },
    { id: 'e04', text: 'Cargador de teléfono' },
    { id: 'e05', text: 'Powerbank' },
    { id: 'e06', text: 'Auriculares' },
    { id: 'e07', text: 'Ropa (cantidad de días + extra)' },
    { id: 'e08', text: 'Zapatos cómodos para caminar' },
    { id: 'e09', text: 'Impermeable o paraguas compacto' },
    { id: 'e10', text: 'Medicamentos básicos' },
    { id: 'e11', text: 'Protector solar' },
    { id: 'e12', text: 'Neceser / artículos de higiene' },
    { id: 'e13', text: 'Cámara de fotos' },
    { id: 'e14', text: 'Efectivo en yenes' },
  ],
}

const DOC_REF = doc(db, 'checklist', 'state')

export default function ChecklistPage() {
  const [section, setSection] = useState<Section>('tareas')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [custom, setCustom] = useState<Record<Section, ItemDef[]>>({ tareas: [], equipaje: [] })
  const [hidden, setHidden] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newText, setNewText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
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
            setChecked((data?.checked as Record<string, boolean>) ?? {})
            setCustom((data?.custom as Record<Section, ItemDef[]>) ?? { tareas: [], equipaje: [] })
            setHidden((data?.hidden as string[]) ?? [])
            setError(null)
            setLoading(false)
          },
          (err) => {
            const e = err as FirebaseError
            if (e?.code === 'permission-denied') {
              setError('No hay permisos para leer la checklist. Revisá las Firestore Rules (permission-denied).')
            } else {
              setError('Error al cargar la checklist.')
            }
            setLoading(false)
          }
        )
      })
      .catch(() => {
        if (cancelled) return
        setError('No se pudo autenticar para cargar la checklist.')
        setLoading(false)
      })

    return () => {
      cancelled = true
      if (unsub) unsub()
    }
  }, [])

  async function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    try {
      await ensureAnonymousAuth()
      await setDoc(DOC_REF, { checked: next }, { merge: true })
      setError(null)
    } catch (err) {
      const e = err as FirebaseError
      if (e?.code === 'permission-denied') {
        setError('No hay permisos para actualizar la checklist. Revisá las Firestore Rules (permission-denied).')
      } else {
        setError('Error al actualizar la checklist.')
      }
      setChecked(checked)
    }
  }

  async function deleteItem(id: string, isCustom: boolean) {
    const nextChecked = { ...checked }
    delete nextChecked[id]
    setChecked(nextChecked)

    let updates: Record<string, unknown> = { checked: nextChecked }

    if (isCustom) {
      const nextCustom = {
        ...custom,
        [section]: (custom[section] ?? []).filter((i) => i.id !== id),
      }
      setCustom(nextCustom)
      updates.custom = nextCustom
    } else {
      const nextHidden = [...hidden, id]
      setHidden(nextHidden)
      updates.hidden = nextHidden
    }

    try {
      await ensureAnonymousAuth()
      await setDoc(DOC_REF, updates, { merge: true })
      setError(null)
    } catch (err) {
      const e = err as FirebaseError
      setError(e?.code === 'permission-denied' ? 'Sin permisos.' : 'Error al eliminar.')
    }
  }

  async function addItem() {
    const text = newText.trim()
    if (!text) return
    const id = `c_${Date.now()}`
    const nextCustom = {
      ...custom,
      [section]: [...(custom[section] ?? []), { id, text }],
    }
    setCustom(nextCustom)
    setNewText('')
    inputRef.current?.focus()
    try {
      await ensureAnonymousAuth()
      await setDoc(DOC_REF, { custom: nextCustom }, { merge: true })
      setError(null)
    } catch (err) {
      const e = err as FirebaseError
      if (e?.code === 'permission-denied') {
        setError('No hay permisos para agregar ítems. Revisá las Firestore Rules (permission-denied).')
      } else {
        setError('Error al guardar el ítem.')
      }
      setCustom(custom)
    }
  }

  const hiddenSet = new Set(hidden)
  const staticItems = ITEMS[section].filter((i) => !hiddenSet.has(i.id))
  const customItems = (custom[section] ?? []).filter((i) => !hiddenSet.has(i.id))
  const allItems = [...staticItems, ...customItems]
  const customIds = new Set((custom[section] ?? []).map((i) => i.id))
  const done = allItems.filter((i) => checked[i.id]).length

  return (
    <div className="page page--scrollable">
      <header className="header">
        <div className="badge">
          <span className="badge-emoji">✅</span>
          <span className="badge-text">Checklist</span>
        </div>
        <h1>Checklist</h1>
        <p className="sub">Compartido entre los 4 — tildá en tiempo real.</p>
      </header>

      <div className="cl-tabs">
        <button
          className={`cl-tab${section === 'tareas' ? ' cl-tab--active' : ''}`}
          onClick={() => setSection('tareas')}
        >
          Tareas previas
        </button>
        <button
          className={`cl-tab${section === 'equipaje' ? ' cl-tab--active' : ''}`}
          onClick={() => setSection('equipaje')}
        >
          Equipaje
        </button>
      </div>

      <div className="card cl-card">
        <div className="cl-progress">
          <span className="cl-progress-text">
            {done} / {allItems.length}
          </span>
          <div className="cl-bar">
            <div
              className="cl-bar-fill"
              style={{ width: allItems.length ? `${(done / allItems.length) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {error ? (
          <p className="sub" style={{ margin: '16px 0 0', textAlign: 'center' }}>
            {error}
          </p>
        ) : loading ? (
          <p className="sub" style={{ margin: '16px 0 0', textAlign: 'center' }}>
            Cargando…
          </p>
        ) : (
          <>
            <ul className="cl-list" role="list">
              {allItems.map((item) => {
                const isChecked = !!checked[item.id]
                const isCustom = customIds.has(item.id)
                return (
                  <li key={item.id} className="has-del">
                    <button
                      className={`cl-item${isChecked ? ' cl-item--done' : ''}`}
                      onClick={() => toggle(item.id)}
                      role="checkbox"
                      aria-checked={isChecked}
                    >
                      <span className={`cl-box${isChecked ? ' cl-box--checked' : ''}`}>
                        {isChecked && (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                          </svg>
                        )}
                      </span>
                      <span className="cl-text">{item.text}</span>
                    </button>
                    <button
                      className="wish-del"
                      onClick={() => setConfirmPending({ action: () => deleteItem(item.id, isCustom) })}
                      aria-label="Eliminar"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>

            <form
              className="cl-add"
              onSubmit={(e) => { e.preventDefault(); addItem() }}
            >
              <input
                ref={inputRef}
                className="cl-add-input"
                type="text"
                placeholder="Agregar ítem…"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                maxLength={80}
              />
              <button
                className="cl-add-btn"
                type="submit"
                disabled={!newText.trim()}
                aria-label="Agregar"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
      {confirmPending && (
        <ConfirmDialog
          message="¿Eliminar este ítem?"
          onConfirm={() => { confirmPending.action(); setConfirmPending(null) }}
          onCancel={() => setConfirmPending(null)}
        />
      )}
    </div>
  )
}
