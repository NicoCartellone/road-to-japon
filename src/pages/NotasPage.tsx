import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { FirebaseError } from 'firebase/app'
import { db } from '../lib/firebase'
import { ensureAnonymousAuth } from '../lib/auth'

type Nota = { id: string; title: string; body: string; updatedAt: number }

const DOC_REF = doc(db, 'notas', 'state')

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ title: string; body: string }>({ title: '', body: '' })
  const titleRef = useRef<HTMLInputElement>(null)

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
            const items = (snap.data()?.items as Nota[]) ?? []
            setNotas(items)
            setError(null)
            setLoading(false)
          },
          (err) => {
            const e = err as FirebaseError
            setError(e?.code === 'permission-denied' ? 'Sin permisos de lectura.' : 'Error al cargar notas.')
            setLoading(false)
          }
        )
      })
      .catch(() => {
        if (cancelled) return
        setError('No se pudo autenticar.')
        setLoading(false)
      })
    return () => { cancelled = true; if (unsub) unsub() }
  }, [])

  async function saveToFirestore(items: Nota[]) {
    try {
      await ensureAnonymousAuth()
      await setDoc(DOC_REF, { items })
      setError(null)
    } catch (err) {
      const e = err as FirebaseError
      setError(e?.code === 'permission-denied' ? 'Sin permisos para guardar.' : 'Error al guardar.')
    }
  }

  function addNota() {
    const newNota: Nota = { id: `n_${Date.now()}`, title: '', body: '', updatedAt: Date.now() }
    const next = [newNota, ...notas]
    setNotas(next)
    saveToFirestore(next)
    setEditingId(newNota.id)
    setDraft({ title: '', body: '' })
    setTimeout(() => titleRef.current?.focus(), 50)
  }

  function startEdit(nota: Nota) {
    setEditingId(nota.id)
    setDraft({ title: nota.title, body: nota.body })
  }

  function saveEdit() {
    if (!editingId) return
    const next = notas.map((n) =>
      n.id === editingId ? { ...n, ...draft, updatedAt: Date.now() } : n
    )
    setNotas(next)
    setEditingId(null)
    saveToFirestore(next)
  }

  function deleteNota(id: string) {
    const next = notas.filter((n) => n.id !== id)
    setNotas(next)
    if (editingId === id) setEditingId(null)
    saveToFirestore(next)
  }

  return (
    <div className="page page--scrollable">
      <header className="header">
        <div className="badge">
          <span className="badge-emoji">📝</span>
          <span className="badge-text">Notas</span>
        </div>
        <h1>Notas</h1>
        <p className="sub">Anotá lo que necesiten recordar — compartido en tiempo real.</p>
      </header>

      <button className="nota-add" onClick={addNota}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
        </svg>
        Nueva nota
      </button>

      {loading ? (
        <p className="sub" style={{ textAlign: 'center', marginTop: 24 }}>Cargando…</p>
      ) : error ? (
        <p className="sub" style={{ textAlign: 'center', marginTop: 24 }}>{error}</p>
      ) : notas.length === 0 ? (
        <p className="sub" style={{ textAlign: 'center', marginTop: 24 }}>Todavía no hay notas.</p>
      ) : (
        <div className="nota-list">
          {notas.map((nota) => {
            const isEditing = editingId === nota.id
            return (
              <div key={nota.id} className={`card nota-card${isEditing ? ' nota-card--editing' : ''}`}>
                {isEditing ? (
                  <>
                    <input
                      ref={titleRef}
                      className="nota-title-input"
                      placeholder="Título…"
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    />
                    <textarea
                      className="nota-body"
                      placeholder="Escribí tu nota acá…"
                      value={draft.body}
                      onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                      rows={5}
                    />
                    <div className="nota-actions">
                      <button className="nota-save" onClick={saveEdit}>Guardar</button>
                      <button className="nota-delete" onClick={() => deleteNota(nota.id)}>Eliminar</button>
                    </div>
                  </>
                ) : (
                  <button className="nota-preview" onClick={() => startEdit(nota)}>
                    <span className="nota-preview-title">{nota.title || 'Sin título'}</span>
                    {nota.body ? (
                      <span className="nota-preview-body">
                        {nota.body.slice(0, 100)}{nota.body.length > 100 ? '…' : ''}
                      </span>
                    ) : null}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
