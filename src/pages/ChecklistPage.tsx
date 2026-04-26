export default function ChecklistPage() {
  return (
    <div className="page">
      <header className="header">
        <div className="badge">✅ Checklist</div>
        <h1>Checklist</h1>
        <p className="sub">Acá vas a poder armar tu lista de cosas antes del viaje.</p>
      </header>

      <section className="card" aria-label="Checklist">
        <p className="sub" style={{ margin: 0 }}>
          Próximamente…
        </p>
      </section>
    </div>
  )
}
