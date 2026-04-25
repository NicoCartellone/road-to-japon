import { useEffect, useMemo, useState } from 'react'

const TARGET = {
  year: 2027,
  month: 1,
  day: 9,
  hour: 23,
  minute: 0,
  second: 0
} as const

const TIME_ZONE = 'America/Argentina/Buenos_Aires'

type Remaining = {
  done: boolean
  dd: number
  hh: number
  mm: number
  ss: number
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
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

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(calcRemaining(target)), 250)
    return () => window.clearInterval(id)
  }, [target])

  useEffect(() => {
    const onNeedRefresh = () => setHasUpdate(true)
    window.addEventListener('pwa:need-refresh', onNeedRefresh)
    return () => window.removeEventListener('pwa:need-refresh', onNeedRefresh)
  }, [])

  return (
    <main className="shell">
      <header className="header">
        <div className="badge">🇯🇵 Road to Japón</div>
        <h1>Cuenta regresiva</h1>
        <p className="sub">
          Falta cada vez menos para el vuelo del <strong>9 de enero de 2027</strong> a las <strong>23:00</strong> (Buenos
          Aires).
        </p>
      </header>

      <section className="card" aria-label="Cuenta regresiva">
        {!remaining.done ? (
          <div className="count" role="timer" aria-live="polite">
            <div className="cell">
              <span className="num">{remaining.dd}</span>
              <span className="lbl">días</span>
            </div>
            <div className="sep">:</div>
            <div className="cell">
              <span className="num">{pad2(remaining.hh)}</span>
              <span className="lbl">horas</span>
            </div>
            <div className="sep">:</div>
            <div className="cell">
              <span className="num">{pad2(remaining.mm)}</span>
              <span className="lbl">min</span>
            </div>
            <div className="sep">:</div>
            <div className="cell">
              <span className="num">{pad2(remaining.ss)}</span>
              <span className="lbl">seg</span>
            </div>
          </div>
        ) : (
          <div className="done">
            <h2>¡Buen viaje!</h2>
            <p>Nos vemos en Japón.</p>
          </div>
        )}

        {hasUpdate ? (
          <button
            className="update"
            type="button"
            onClick={() => {
              // En prompt mode, la forma más simple de aplicar el update es recargar.
              // El nuevo SW se activará y agarrará los nuevos assets.
              window.location.reload()
            }}
          >
            Hay una actualización — Aplicar
          </button>
        ) : null}
      </section>

      <footer className="footer">
        <small>Tip: agregala a tu pantalla de inicio para usarla como app.</small>
      </footer>
    </main>
  )
}
