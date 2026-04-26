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

type PwaNeedRefreshEvent = CustomEvent<{
  updateSW: (reloadPage?: boolean) => Promise<void>
}>

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
          ) : null}
        </section>

        <footer className="footer">
          <small>Tip: agregala a tu pantalla de inicio para usarla como app.</small>
        </footer>
      </div>

      <nav className="bottom-nav" aria-label="Navegación">
        <button type="button" className="nav-btn is-active" aria-label="Inicio">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
            <path
              fill="currentColor"
              d="M12 3.1 3.5 10.3a1 1 0 0 0-.35.76V20a1.5 1.5 0 0 0 1.5 1.5H9a1 1 0 0 0 1-1v-5.5h4V20.5a1 1 0 0 0 1 1h4.35A1.5 1.5 0 0 0 20.85 20v-8.94a1 1 0 0 0-.35-.76L12 3.1Z"
            />
          </svg>
        </button>
        <button type="button" className="nav-btn" aria-label="Lista">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
            <path fill="currentColor" d="M7 6.5h14v2H7v-2Zm0 5h14v2H7v-2Zm0 5h14v2H7v-2Z" />
            <path fill="currentColor" d="M3 7a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm0 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm0 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" />
          </svg>
        </button>
        <button type="button" className="nav-btn" aria-label="Mapa">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
            <path
              fill="currentColor"
              d="M12 2.75c-3.6 0-6.5 2.86-6.5 6.38 0 4.77 5.2 10.62 6.16 11.67a.5.5 0 0 0 .68 0c.96-1.05 6.16-6.9 6.16-11.67 0-3.52-2.9-6.38-6.5-6.38Zm0 9.1a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z"
            />
          </svg>
        </button>
        <button type="button" className="nav-btn" aria-label="Perfil">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
            <path
              fill="currentColor"
              d="M12 12.2a4.3 4.3 0 1 0-4.3-4.3 4.3 4.3 0 0 0 4.3 4.3Zm0 2.1c-4.06 0-7.35 2.2-7.35 4.9 0 .5.4.9.9.9h12.9c.5 0 .9-.4.9-.9 0-2.7-3.29-4.9-7.35-4.9Z"
            />
          </svg>
        </button>
      </nav>
    </main>
  )
}
