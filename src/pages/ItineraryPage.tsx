import { useState } from 'react'

type Activity = { time?: string; text: string }
type Day = {
  id: string
  label: string
  date: string
  city: string
  emoji: string
  activities: Activity[]
}

const DAYS: Day[] = [
  {
    id: 'd01', label: 'Día 1', date: 'Sáb 9 ene', city: 'Buenos Aires', emoji: '🛫',
    activities: [
      { time: '23:00', text: 'Vuelo desde EZE' },
      { text: 'Aprox. 30 hs de viaje con escala' },
    ],
  },
  {
    id: 'd02', label: 'Día 2', date: 'Dom 10 ene', city: 'En vuelo', emoji: '✈️',
    activities: [
      { text: 'Escala y conexión' },
      { text: 'Cruce de la línea de fecha internacional' },
    ],
  },
  {
    id: 'd03', label: 'Día 3', date: 'Lun 11 ene', city: 'Tokyo', emoji: '🗼',
    activities: [
      { text: 'Llegada a Narita / Haneda' },
      { text: 'Traslado al hotel (Narita Express o Limousine Bus)' },
      { text: 'Check-in y descanso' },
      { text: 'Primeros pasos: konbini y ramen cerca del hotel' },
    ],
  },
  {
    id: 'd04', label: 'Día 4', date: 'Mar 12 ene', city: 'Tokyo', emoji: '🗼',
    activities: [
      { text: 'Shinjuku: Kabukicho y Golden Gai' },
      { text: 'Meiji Shrine y Harajuku' },
      { text: 'Shibuya Crossing y Shibuya Sky (opcional)' },
    ],
  },
  {
    id: 'd05', label: 'Día 5', date: 'Mié 13 ene', city: 'Tokyo', emoji: '🗼',
    activities: [
      { text: 'Asakusa: Senso-ji y Nakamise' },
      { text: 'Akihabara: electrónica y cultura pop' },
      { text: 'Ueno Park y museos (opcional)' },
    ],
  },
  {
    id: 'd06', label: 'Día 6', date: 'Jue 14 ene', city: 'Kamakura', emoji: '🏯',
    activities: [
      { text: 'Excursión de día desde Tokyo (1 hora en tren)' },
      { text: 'Gran Buda de Kotoku-in' },
      { text: 'Tsurugaoka Hachimangu y playa de Yuigahama' },
      { text: 'Vuelta a Tokyo por la tarde' },
    ],
  },
  {
    id: 'd07', label: 'Día 7', date: 'Vie 15 ene', city: 'Tokyo → Kyoto', emoji: '🚄',
    activities: [
      { text: 'Shinkansen Nozomi (aprox. 2 hs 30 min)' },
      { text: 'Llegada a Kyoto y check-in' },
      { text: 'Gion de noche: maiko y machiya' },
    ],
  },
  {
    id: 'd08', label: 'Día 8', date: 'Sáb 16 ene', city: 'Kyoto', emoji: '⛩️',
    activities: [
      { text: 'Fushimi Inari al amanecer (madrugar!)' },
      { text: 'Kinkakuji — el Pabellón Dorado' },
      { text: 'Arashiyama: bamboo grove y puente Togetsukyo' },
    ],
  },
  {
    id: 'd09', label: 'Día 9', date: 'Dom 17 ene', city: 'Nara', emoji: '🦌',
    activities: [
      { text: 'Excursión desde Kyoto (45 min en tren)' },
      { text: 'Nara Park: ciervos sueltos por todos lados' },
      { text: 'Todai-ji: Gran Buda de bronce' },
      { text: 'Vuelta a Kyoto' },
    ],
  },
  {
    id: 'd10', label: 'Día 10', date: 'Lun 18 ene', city: 'Kyoto → Osaka', emoji: '🐙',
    activities: [
      { text: "Philosopher's Path y templos del norte de Kyoto" },
      { text: 'Traslado a Osaka (30 min en tren)' },
      { text: 'Dotonbori: takoyaki y luces de noche' },
    ],
  },
  {
    id: 'd11', label: 'Día 11', date: 'Mar 19 ene', city: 'Osaka', emoji: '🐙',
    activities: [
      { text: 'Osaka Castle y parque' },
      { text: 'Shinsekai y kushikatsu' },
      { text: 'Namba: compras y street food' },
    ],
  },
  {
    id: 'd12', label: 'Día 12', date: 'Mié 20 ene', city: 'Hiroshima', emoji: '☮️',
    activities: [
      { text: 'Shinkansen desde Osaka (aprox. 1 hs 30 min)' },
      { text: 'Parque Memorial de la Paz y museo' },
      { text: 'Miyajima: torii flotante y ciervos' },
      { text: 'Vuelta a Osaka' },
    ],
  },
  {
    id: 'd13', label: 'Día 13', date: 'Jue 21 ene', city: 'Osaka', emoji: '🛍️',
    activities: [
      { text: 'Día libre: compras, karaoke, onsen' },
      { text: 'Shinsaibashi y Amerikamura' },
      { text: 'Última cena: yakiniku o kaiseki' },
    ],
  },
  {
    id: 'd14', label: 'Día 14', date: 'Vie 22 ene', city: 'Osaka → Buenos Aires', emoji: '🛬',
    activities: [
      { text: 'Check-out temprano' },
      { text: 'Vuelo desde KIX / ITM' },
      { text: 'Aprox. 30 hs de regreso' },
    ],
  },
]

export default function ItineraryPage() {
  const [open, setOpen] = useState<string | null>(null)

  function toggle(id: string) {
    setOpen((prev) => (prev === id ? null : id))
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

      <div className="itin-list">
        {DAYS.map((day) => {
          const isOpen = open === day.id
          return (
            <div key={day.id} className="itin-day card">
              <button
                className="itin-day-header"
                onClick={() => toggle(day.id)}
                aria-expanded={isOpen}
              >
                <div className="itin-day-meta">
                  <span className="itin-day-label">{day.label}</span>
                  <span className="itin-day-date">{day.date}</span>
                </div>
                <span className="itin-city">
                  <span className="itin-city-emoji">{day.emoji}</span>
                  {day.city}
                </span>
                <svg
                  className={`phrase-chevron${isOpen ? ' phrase-chevron--open' : ''}`}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
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
    </div>
  )
}
