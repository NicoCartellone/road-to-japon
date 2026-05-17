import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { FirebaseError } from 'firebase/app'
import { db } from '../lib/firebase'
import { ensureAnonymousAuth } from '../lib/auth'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            setChecked((snap.data()?.checked as Record<string, boolean>) ?? {})
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
      // Revertimos el optimistic update
      setChecked(checked)
    }
  }

  const items = ITEMS[section]
  const done = items.filter((i) => checked[i.id]).length

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
            {done} / {items.length}
          </span>
          <div className="cl-bar">
            <div
              className="cl-bar-fill"
              style={{ width: `${(done / items.length) * 100}%` }}
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
          <ul className="cl-list" role="list">
            {items.map((item) => {
              const isChecked = !!checked[item.id]
              return (
                <li key={item.id}>
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
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
