import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ChecklistPage from './pages/ChecklistPage'
import ConverterPage from './pages/ConverterPage'
import HomePage from './pages/HomePage'
import ItineraryPage from './pages/ItineraryPage'
import NotasPage from './pages/NotasPage'
import PhrasesPage from './pages/PhrasesPage'
import BottomNav from './shared/ui/BottomNav'

const TARGET = {
  year: 2027,
  month: 1,
  day: 9,
  hour: 23,
  minute: 0,
  second: 0
} as const

const TIME_ZONE = 'America/Argentina/Buenos_Aires'

type PwaNeedRefreshEvent = CustomEvent<{
  updateSW: (reloadPage?: boolean) => Promise<void>
}>

type Remaining = {
  done: boolean
  dd: number
  hh: number
  mm: number
  ss: number
}

function getTimeZoneOffsetMs(timeZone: string, epochMs: number): number {
  // offset = (hora en tz) - (hora en UTC)
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const parts = dtf.formatToParts(new Date(epochMs))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  const asUtc = Date.UTC(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')),
    Number(get('minute')),
    Number(get('second'))
  )
  return asUtc - epochMs
}

function getTargetEpochMsInBuenosAires(): number {
  const iso = `${TARGET.year.toString().padStart(4, '0')}-${String(TARGET.month).padStart(2, '0')}-${String(
    TARGET.day
  ).padStart(2, '0')}T${String(TARGET.hour).padStart(2, '0')}:${String(TARGET.minute).padStart(2, '0')}:${String(
    TARGET.second
  ).padStart(2, '0')}`

  // Interpretamos el ISO como si fuese UTC y corregimos con el offset de BA para ese instante.
  const assumedUtc = new Date(`${iso}Z`).getTime()
  const offsetMs = getTimeZoneOffsetMs(TIME_ZONE, assumedUtc)
  return assumedUtc - offsetMs
}

function calcRemaining(targetEpochMs: number): Remaining {
  const now = Date.now()
  const remainingMs = Math.max(0, targetEpochMs - now)
  const totalSeconds = Math.floor(remainingMs / 1000)

  const dd = Math.floor(totalSeconds / 86400)
  const hh = Math.floor((totalSeconds % 86400) / 3600)
  const mm = Math.floor((totalSeconds % 3600) / 60)
  const ss = totalSeconds % 60

  return {
    done: remainingMs === 0,
    dd,
    hh,
    mm,
    ss
  }
}

export default function App() {
  const target = useMemo(() => getTargetEpochMsInBuenosAires(), [])
  const [remaining, setRemaining] = useState<Remaining>(() => calcRemaining(target))
  const [hasUpdate, setHasUpdate] = useState(false)
  const [updateFn, setUpdateFn] = useState<null | ((reloadPage?: boolean) => Promise<void>)>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(calcRemaining(target)), 250)
    return () => window.clearInterval(id)
  }, [target])

  useEffect(() => {
    const onNeedRefresh = (e: Event) => {
      const ev = e as PwaNeedRefreshEvent
      setUpdateFn(() => ev.detail.updateSW)
      setHasUpdate(true)
    }
    window.addEventListener('pwa:need-refresh', onNeedRefresh)
    return () => window.removeEventListener('pwa:need-refresh', onNeedRefresh)
  }, [])

  return (
    <main className="shell">
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage remaining={remaining} />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/itinerario" element={<ItineraryPage />} />
          <Route path="/conversor" element={<ConverterPage />} />
          <Route path="/frases" element={<PhrasesPage />} />
          <Route path="/notas" element={<NotasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {hasUpdate ? (
        <div className="update-bar" role="status" aria-live="polite">
          <button
            className="update"
            type="button"
            onClick={async () => {
              // En algunos navegadores (especialmente iOS) el "reload" automático
              // puede no ejecutarse aunque el SW nuevo quede en waiting.
              // Estrategia robusta: pedir skipWaiting y luego recargar nosotros.
              setIsUpdating(true)

              const waitForControllerChange = (timeoutMs = 1500) =>
                new Promise<void>((resolve) => {
                  if (!('serviceWorker' in navigator)) return resolve()
                  const sw = navigator.serviceWorker
                  const onChange = () => resolve()
                  sw.addEventListener('controllerchange', onChange, { once: true })
                  window.setTimeout(resolve, timeoutMs)
                })

              try {
                if (updateFn) {
                  // NO le pedimos que recargue automáticamente.
                  await updateFn(false)
                  await waitForControllerChange()
                }
              } finally {
                window.location.reload()
              }
            }}
            disabled={isUpdating}
          >
            {isUpdating ? 'Actualizando…' : 'Hay una actualización — Aplicar'}
          </button>
        </div>
      ) : null}

      <BottomNav />
    </main>
  )
}
