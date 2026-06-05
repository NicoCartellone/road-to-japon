type Remaining = {
  done: boolean
  mo: number
  dd: number
  hh: number
  mm: number
  ss: number
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

type Props = {
  remaining: Remaining
}

export default function HomePage({ remaining }: Props) {
  return (
    <div className="page page--center">
      <header className="header">
        <div className="badge">🇯🇵 Road to Japón</div>
        <h1>Cuenta regresiva</h1>
        <p className="sub">
          Falta cada vez menos para el vuelo del <strong>9 de enero de 2027</strong> a las <strong>23:00</strong> (Buenos
          Aires).
        </p>
      </header>

      <section className="card" aria-label="Cuenta regresiva" style={{ position: 'relative' }}>
        {!remaining.done ? (
          <div className="count" role="timer" aria-live="polite">
            <div className="cell">
              <span className="num">{remaining.mo}</span>
              <span className="lbl">meses</span>
            </div>
            <div className="sep">:</div>
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
        <p className="app-version" style={{ position: 'absolute', bottom: -30, left: 0, right: 0 }}>v{__APP_VERSION__}</p>
      </section>
    </div>
  )
}
