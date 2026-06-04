import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { FirebaseError } from 'firebase/app'
import { db } from '../lib/firebase'
import { ensureAnonymousAuth } from '../lib/auth'
import ConfirmDialog from '../shared/ui/ConfirmDialog'

type Activity = { time?: string; text: string }
type Day = {
  id: string
  label: string
  date: string
  city: string
  emoji: string
  tempMin: number
  tempMax: number
  activities: Activity[]
}

const DAYS: Day[] = [
  {
    id: 'd01', label: 'Día 1', date: 'Sáb 9 ene', city: 'Buenos Aires', emoji: '🛫', tempMin: 22, tempMax: 30,
    activities: [
      { time: '23:00', text: 'Vuelo desde EZE' },
      { text: 'Aprox. 30 hs de viaje con escala' },
    ],
  },
  {
    id: 'd02', label: 'Día 2', date: 'Dom 10 ene', city: 'En vuelo', emoji: '✈️', tempMin: 0, tempMax: 0,
    activities: [
      { text: 'Escala y conexión' },
      { text: 'Cruce de la línea de fecha internacional' },
    ],
  },
  {
    id: 'd03', label: 'Día 3', date: 'Lun 11 ene', city: 'Tokyo', emoji: '🗼', tempMin: 3, tempMax: 10,
    activities: [
      { text: 'Llegada a Narita / Haneda' },
      { text: 'Traslado al hotel (Narita Express o Limousine Bus)' },
      { text: 'Check-in y descanso' },
      { text: 'Primeros pasos: konbini y ramen cerca del hotel' },
    ],
  },
  {
    id: 'd04', label: 'Día 4', date: 'Mar 12 ene', city: 'Tokyo', emoji: '🗼', tempMin: 3, tempMax: 10,
    activities: [
      { text: 'Shinjuku: Kabukicho y Golden Gai' },
      { text: 'Meiji Shrine y Harajuku' },
      { text: 'Shibuya Crossing y Shibuya Sky (opcional)' },
    ],
  },
  {
    id: 'd05', label: 'Día 5', date: 'Mié 13 ene', city: 'Tokyo', emoji: '🗼', tempMin: 3, tempMax: 10,
    activities: [
      { text: 'Asakusa: Senso-ji y Nakamise' },
      { text: 'Akihabara: electrónica y cultura pop' },
      { text: 'Ueno Park y museos (opcional)' },
    ],
  },
  {
    id: 'd06', label: 'Día 6', date: 'Jue 14 ene', city: 'Kamakura', emoji: '🏯', tempMin: 3, tempMax: 11,
    activities: [
      { text: 'Excursión de día desde Tokyo (1 hora en tren)' },
      { text: 'Gran Buda de Kotoku-in' },
      { text: 'Tsurugaoka Hachimangu y playa de Yuigahama' },
      { text: 'Vuelta a Tokyo por la tarde' },
    ],
  },
  {
    id: 'd07', label: 'Día 7', date: 'Vie 15 ene', city: 'Tokyo → Kyoto', emoji: '🚄', tempMin: 3, tempMax: 9,
    activities: [
      { text: 'Shinkansen Nozomi (aprox. 2 hs 30 min)' },
      { text: 'Llegada a Kyoto y check-in' },
      { text: 'Gion de noche: maiko y machiya' },
    ],
  },
  {
    id: 'd08', label: 'Día 8', date: 'Sáb 16 ene', city: 'Kyoto', emoji: '⛩️', tempMin: 2, tempMax: 9,
    activities: [
      { text: 'Fushimi Inari al amanecer (madrugar!)' },
      { text: 'Kinkakuji — el Pabellón Dorado' },
      { text: 'Arashiyama: bamboo grove y puente Togetsukyo' },
    ],
  },
  {
    id: 'd09', label: 'Día 9', date: 'Dom 17 ene', city: 'Nara', emoji: '🦌', tempMin: 2, tempMax: 10,
    activities: [
      { text: 'Excursión desde Kyoto (45 min en tren)' },
      { text: 'Nara Park: ciervos sueltos por todos lados' },
      { text: 'Todai-ji: Gran Buda de bronce' },
      { text: 'Vuelta a Kyoto' },
    ],
  },
  {
    id: 'd10', label: 'Día 10', date: 'Lun 18 ene', city: 'Kyoto → Osaka', emoji: '🐙', tempMin: 4, tempMax: 10,
    activities: [
      { text: "Philosopher's Path y templos del norte de Kyoto" },
      { text: 'Traslado a Osaka (30 min en tren)' },
      { text: 'Dotonbori: takoyaki y luces de noche' },
    ],
  },
  {
    id: 'd11', label: 'Día 11', date: 'Mar 19 ene', city: 'Osaka', emoji: '🐙', tempMin: 4, tempMax: 10,
    activities: [
      { text: 'Osaka Castle y parque' },
      { text: 'Shinsekai y kushikatsu' },
      { text: 'Namba: compras y street food' },
    ],
  },
  {
    id: 'd12', label: 'Día 12', date: 'Mié 20 ene', city: 'Hiroshima', emoji: '☮️', tempMin: 3, tempMax: 10,
    activities: [
      { text: 'Shinkansen desde Osaka (aprox. 1 hs 30 min)' },
      { text: 'Parque Memorial de la Paz y museo' },
      { text: 'Miyajima: torii flotante y ciervos' },
      { text: 'Vuelta a Osaka' },
    ],
  },
  {
    id: 'd13', label: 'Día 13', date: 'Jue 21 ene', city: 'Osaka', emoji: '🛍️', tempMin: 4, tempMax: 10,
    activities: [
      { text: 'Día libre: compras, karaoke, onsen' },
      { text: 'Shinsaibashi y Amerikamura' },
      { text: 'Última cena: yakiniku o kaiseki' },
    ],
  },
  {
    id: 'd14', label: 'Día 14', date: 'Vie 22 ene', city: 'Osaka → Buenos Aires', emoji: '🛬', tempMin: 4, tempMax: 10,
    activities: [
      { text: 'Check-out temprano' },
      { text: 'Vuelo desde KIX / ITM' },
      { text: 'Aprox. 30 hs de regreso' },
    ],
  },
]

type WishItem = { id: string; text: string; done: boolean }
const WISH_DOC = doc(db, 'wishlist', 'state')

export default function ItineraryPage() {
  const [tab, setTab] = useState<'itinerario' | 'wishlist'>('itinerario')
  const [open, setOpen] = useState<string | null>(null)

  // Wishlist state
  const [items, setItems] = useState<WishItem[]>([])
  const [wishLoading, setWishLoading] = useState(true)
  const [wishError, setWishError] = useState<string | null>(null)
  const [newWish, setNewWish] = useState('')
  const [confirmPending, setConfirmPending] = useState<{ action: () => void } | null>(null)

  useEffect(() => {
    let unsub: null | (() => void) = null
    let cancelled = false
    ensureAnonymousAuth()
      .then(() => {
        if (cancelled) return
        unsub = onSnapshot(
          WISH_DOC,
          (snap) => {
            setItems((snap.data()?.items as WishItem[]) ?? [])
            setWishLoading(false)
            setWishError(null)
          },
          (err) => {
            const e = err as FirebaseError
            setWishError(e?.code === 'permission-denied' ? 'Sin permisos.' : 'Error al cargar.')
            setWishLoading(false)
          }
        )
      })
      .catch(() => { if (!cancelled) { setWishError('No se pudo autenticar.'); setWishLoading(false) } })
    return () => { cancelled = true; if (unsub) unsub() }
  }, [])

  async function persistWish(next: WishItem[]) {
    try {
      await ensureAnonymousAuth()
      await setDoc(WISH_DOC, { items: next })
    } catch (err) {
      const e = err as FirebaseError
      setWishError(e?.code === 'permission-denied' ? 'Sin permisos.' : 'Error al guardar.')
    }
  }

  async function addWish() {
    const text = newWish.trim()
    if (!text) return
    const next = [...items, { id: `w_${Date.now()}`, text, done: false }]
    setItems(next)
    setNewWish('')
    await persistWish(next)
  }

  async function toggleWish(id: string) {
    const next = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    setItems(next)
    await persistWish(next)
  }

  async function deleteWish(id: string) {
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    await persistWish(next)
  }

  return (
    <div className="page page--scrollable">
      <header className="header">
        <div className="badge">
          <span className="badge-emoji">🗺️</span>
          <span className="badge-text">Itinerario</span>
        </div>
        <h1>Itinerario</h1>
        <p className="sub">14 días en Japón — enero 2027.</p>
      </header>

      <div className="cl-tabs">
        <button className={`cl-tab${tab === 'itinerario' ? ' cl-tab--active' : ''}`} onClick={() => setTab('itinerario')}>
          Día a día
        </button>
        <button className={`cl-tab${tab === 'wishlist' ? ' cl-tab--active' : ''}`} onClick={() => setTab('wishlist')}>
          Wishlist
        </button>
      </div>

      {tab === 'itinerario' && (
        <div className="itin-list">
          {DAYS.map((day) => {
            const isOpen = open === day.id
            const showTemp = day.tempMin > 0 || day.tempMax > 0
            return (
              <div key={day.id} className="itin-day card">
                <button className="itin-day-header" onClick={() => setOpen(isOpen ? null : day.id)} aria-expanded={isOpen}>
                  <div className="itin-day-meta">
                    <span className="itin-day-label">{day.label}</span>
                    <span className="itin-day-date">{day.date}</span>
                  </div>
                  <span className="itin-city">
                    <span className="itin-city-emoji">{day.emoji}</span>
                    {day.city}
                  </span>
                  {showTemp && (
                    <span className="itin-temp">{day.tempMin}–{day.tempMax}°C</span>
                  )}
                  <svg className={`phrase-chevron${isOpen ? ' phrase-chevron--open' : ''}`} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M7 10l5 5 5-5H7Z" />
                  </svg>
                </button>
                {isOpen && (
                  <ul className="itin-activities" role="list">
                    {day.activities.map((a, i) => (
                      <li key={i} className="itin-activity">
                        {a.time && <span className="itin-time">{a.time}</span>}
                        <span className="itin-activity-text">{a.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'wishlist' && (
        <div>
          <form className="cl-add" style={{ marginBottom: 16 }} onSubmit={(e) => { e.preventDefault(); addWish() }}>
            <input
              className="cl-add-input"
              placeholder="Agregar lugar, restaurant, actividad…"
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              maxLength={80}
            />
            <button className="cl-add-btn" type="submit" disabled={!newWish.trim()} aria-label="Agregar">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
              </svg>
            </button>
          </form>

          {wishLoading ? (
            <p className="sub" style={{ textAlign: 'center' }}>Cargando…</p>
          ) : wishError ? (
            <p className="sub" style={{ textAlign: 'center' }}>{wishError}</p>
          ) : items.length === 0 ? (
            <p className="sub" style={{ textAlign: 'center' }}>Todavía no hay lugares en la wishlist.</p>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <ul className="wish-list" role="list">
                {items.map((item) => (
                  <li key={item.id} className="wish-item">
                    <button
                      className={`wish-check${item.done ? ' wish-check--done' : ''}`}
                      onClick={() => toggleWish(item.id)}
                      aria-label={item.done ? 'Marcar pendiente' : 'Marcar hecho'}
                    >
                      <span className={`cl-box${item.done ? ' cl-box--checked' : ''}`}>
                        {item.done && (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                          </svg>
                        )}
                      </span>
                      <span className={`wish-text${item.done ? ' wish-text--done' : ''}`}>{item.text}</span>
                    </button>
                    <button className="wish-del" onClick={() => setConfirmPending({ action: () => deleteWish(item.id) })} aria-label="Eliminar">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {confirmPending && (
        <ConfirmDialog
          message="¿Eliminar este lugar?"
          onConfirm={() => { confirmPending.action(); setConfirmPending(null) }}
          onCancel={() => setConfirmPending(null)}
        />
      )}
    </div>
  )
}
